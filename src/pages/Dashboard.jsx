import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from "recharts";
import { CreditCard, Wallet, Activity, Plus, Target } from "lucide-react";
import DataTable from "../components/ui/DataTable";
import { Skeleton } from "../components/ui/Skeleton";
import { motion } from "framer-motion";
import { useTransactions } from "../hooks/use-transactions";
import { useBudgets } from "../hooks/use-budgets";
import { getCategoryLabel, getTypeLabel } from "../utils/categories";
import MonthSelector from "../components/ui/MonthSelector";
import BudgetModal from "../components/budgets/BudgetModal";

const COLORS = ["#00E5BC", "#3B82F6", "#F59E0B", "#6B7280", "#F43F5E"];

// Returns HSL color + glow based on spend ratio
function getGaugeStyle(ratio) {
  if (ratio >= 1.0) {
    return {
      color: "#FF3B30",
      glow: "0 0 14px rgba(255,59,48,0.7)",
      label: "OVERSPENT",
      labelColor: "#FF3B30",
      pulse: true,
    };
  }
  if (ratio >= 0.8) {
    return {
      color: "#FFB340",
      glow: "0 0 14px rgba(255,179,64,0.6)",
      label: "WARNING",
      labelColor: "#FFB340",
      pulse: false,
    };
  }
  return {
    color: "#00E599",
    glow: "0 0 14px rgba(0,229,153,0.4)",
    label: "ON TRACK",
    labelColor: "#00E599",
    pulse: false,
  };
}

function BudgetGauge({ budget, spent }) {
  const ratio = budget.amount > 0 ? Math.min(spent / budget.amount, 1.2) : 0;
  const displayRatio = Math.min(ratio, 1);
  const style = getGaugeStyle(ratio);
  const [hover, setHover] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-white/[0.06] bg-black/40 p-5 space-y-3 hover:border-white/10 transition-colors group cursor-default"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={hover ? { borderColor: style.color + "30" } : {}}
    >
      {/* Top row */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
            {getCategoryLabel(budget.category)}
          </p>
          <p
            className={`text-[8px] font-bold uppercase tracking-widest mt-0.5 ${style.pulse ? "animate-pulse" : ""}`}
            style={{ color: style.labelColor }}
          >
            {style.label}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-mono font-bold text-white">
            ${spent.toFixed(0)}{" "}
            <span className="text-white/30 font-light">/ ${budget.amount.toFixed(0)}</span>
          </p>
          <p className="text-[9px] font-mono text-white/30 mt-0.5">
            {(ratio * 100).toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-white/5 w-full overflow-hidden rounded-full">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${displayRatio * 100}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            background: style.color,
            boxShadow: style.glow,
          }}
        />
      </div>

      {/* Remaining */}
      <p className="text-[9px] font-mono text-white/30">
        {ratio < 1
          ? `$${(budget.amount - spent).toFixed(2)} remaining`
          : `$${(spent - budget.amount).toFixed(2)} over budget`}
      </p>
    </motion.div>
  );
}

export default function Dashboard() {
  const { data: transactions = [], isLoading } = useTransactions();
  const { data: budgets = [] } = useBudgets();
  const { selectedMonth, setSelectedMonth } = useOutletContext();
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  // Derive numeric month/year from selectedMonth string (e.g. "2026-05")
  const { prefillMonth, prefillYear } = useMemo(() => {
    if (!selectedMonth || selectedMonth === "ALL") {
      const now = new Date();
      return { prefillMonth: now.getMonth() + 1, prefillYear: now.getFullYear() };
    }
    const [y, m] = selectedMonth.split("-");
    return { prefillMonth: Number(m), prefillYear: Number(y) };
  }, [selectedMonth]);

  const filteredTransactions = useMemo(() => {
    if (selectedMonth === "ALL") return transactions;
    return transactions.filter(t => {
      if (!t.date) return false;
      const d = new Date(t.date);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      return `${y}-${m}` === selectedMonth;
    });
  }, [transactions, selectedMonth]);

  const totalIncome = useMemo(() => {
    return filteredTransactions
      .filter(t => t.flow === "INCOME")
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [filteredTransactions]);

  const totalSpent = useMemo(() => {
    return filteredTransactions
      .filter(t => t.flow === "EXPENSE" || !t.flow)
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [filteredTransactions]);

  const netBalance = useMemo(() => {
    return totalIncome - totalSpent;
  }, [totalIncome, totalSpent]);

  const categoryData = useMemo(() => {
    const expenses = filteredTransactions.filter(t => t.flow === "EXPENSE" || !t.flow);
    return Object.entries(
      expenses.reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name: getCategoryLabel(name), value }));
  }, [filteredTransactions]);

  // Budget data: match budgets to the selected month/year only
  const budgetGauges = useMemo(() => {
    // Spend per category (raw keys) for the current filter
    const spendMap = filteredTransactions
      .filter(t => t.flow === "EXPENSE" || !t.flow)
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});

    // Only show budgets for the specific selected month — never for ALL TIME
    if (selectedMonth === "ALL") return [];

    const relevantBudgets = budgets.filter(
      b => b.month === prefillMonth && b.year === prefillYear
    );

    return relevantBudgets.map(b => ({
      budget: b,
      spent: spendMap[b.category] || 0,
    }));
  }, [budgets, filteredTransactions, selectedMonth, prefillMonth, prefillYear]);

  const columns = [
    { header: "Date", accessorKey: "date", cell: info => <span className="font-mono text-xs opacity-70">{new Date(info.getValue()).toLocaleDateString()}</span> },
    { header: "Category", accessorKey: "category", cell: info => <span className="text-xs font-bold uppercase tracking-tighter opacity-80">{getCategoryLabel(info.getValue())}</span> },
    { header: "Type", accessorKey: "type", cell: info => (
      <span className={`text-[10px] font-bold uppercase tracking-widest ${info.getValue() === "CASH" ? "text-[#00E599]" : "text-white opacity-40"}`}>
        {getTypeLabel(info.getValue())}
      </span>
    )},
    { header: "Amount", cell: info => {
      const t = info.row.original;
      const isIncome = t.flow === "INCOME";
      return (
        <span className={`font-mono text-sm font-bold ${isIncome ? "text-[#00E599]" : "text-white"}`}>
          {isIncome ? `+ $${t.amount.toFixed(2)}` : `- $${t.amount.toFixed(2)}`}
        </span>
      );
    }},
  ];

  if (isLoading) {
    return (
      <div className="space-y-12">
        <div className="space-y-4">
          <Skeleton className="h-12 w-64 bg-white/5" />
          <Skeleton className="h-4 w-96 bg-white/5" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-border">
          <Skeleton className="h-32 w-full border-r border-border" />
          <Skeleton className="h-32 w-full border-r border-border" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <>
      <BudgetModal
        isOpen={budgetModalOpen}
        onClose={() => {
          setBudgetModalOpen(false);
          setEditingBudget(null);
        }}
        prefillMonth={prefillMonth}
        prefillYear={prefillYear}
        existingBudget={editingBudget}
      />

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-16 pb-20"
      >
        <motion.div variants={item} className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-8 gap-6 w-full">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white flex flex-wrap items-center gap-4">
               Live View <span className="text-[10px] font-mono text-[#00E599] border border-[#00E599]/30 px-2 py-1 rounded-sm uppercase tracking-widest animate-pulse">Sync</span>
            </h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Real-time spending overview</p>
          </div>
          <MonthSelector 
            transactions={transactions} 
            selectedMonth={selectedMonth} 
            onChange={setSelectedMonth} 
          />
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 border border-border divide-y md:divide-y-0 md:divide-x divide-border bg-black/50 overflow-hidden">
          <motion.div variants={item} className="p-8 space-y-6 hover:bg-white/[0.02] transition-colors group">
            <div className="flex justify-between items-center text-muted-foreground">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Total Earnings</span>
              <Activity size={14} className="group-hover:text-[#00E599] transition-colors" />
            </div>
            <div className="space-y-1">
              <p className="text-5xl font-mono font-bold tracking-tighter text-white">
                <span className="text-[#00E599] text-3xl font-light mr-1">$</span>
                {totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="h-[2px] bg-[#00E599]/20 w-full overflow-hidden">
                  <motion.div 
                      initial={{ x: "-100%" }}
                      animate={{ x: "0%" }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-[#00E599] w-full shadow-[0_0_10px_#00E599]" 
                  />
              </div>
            </div>
          </motion.div>
          
          <motion.div variants={item} className="p-8 space-y-6 hover:bg-white/[0.02] transition-colors group">
            <div className="flex justify-between items-center text-muted-foreground">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Total Spending</span>
              <Wallet size={14} className="group-hover:text-white transition-colors" />
            </div>
            <p className="text-5xl font-mono font-bold tracking-tighter text-white">
              <span className="opacity-20 text-3xl font-light mr-1">$</span>
              {totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </motion.div>
 
          <motion.div variants={item} className="p-8 space-y-6 hover:bg-white/[0.02] transition-colors group">
            <div className="flex justify-between items-center text-muted-foreground">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Net Cash Position</span>
              <CreditCard size={14} className="group-hover:text-white transition-colors" />
            </div>
            <p className={`text-5xl font-mono font-bold tracking-tighter ${netBalance >= 0 ? "text-[#00E599]" : "text-red-500"}`}>
               <span className="opacity-50 text-3xl font-light mr-1">$</span>
               {netBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </motion.div>
        </div>

        {/* ─── Budget Gauges ─────────────────────────────────────── */}
        <motion.div variants={item} className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#00E599] rotate-45" />
              <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white">Category Budgets</h3>
              {selectedMonth !== "ALL" && budgetGauges.length > 0 && (
                <span className="text-[9px] font-mono text-white/30 border border-white/10 px-2 py-0.5">
                  {budgetGauges.filter(g => g.spent / g.budget.amount >= 1).length} overspent
                </span>
              )}
            </div>
            <button
              id="add-budget-btn"
              onClick={() => setBudgetModalOpen(true)}
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#00E599] border border-[#00E599]/20 px-4 py-2 hover:bg-[#00E599]/5 hover:border-[#00E599]/40 transition-all"
            >
              <Plus size={11} />
              Set Budget
            </button>
          </div>

          {selectedMonth === "ALL" ? (
            /* Nudge: budgets are monthly — ask user to pick a month */
            <div className="border border-dashed border-white/10 p-10 text-center space-y-3">
              <Target size={22} className="text-white/10 mx-auto" />
              <p className="text-[11px] text-white/30 uppercase tracking-[0.2em] font-bold">
                Select a month to view budgets
              </p>
              <p className="text-[10px] text-white/20 max-w-xs mx-auto leading-relaxed">
                Budget limits are tracked per calendar month. Pick a specific month from the selector above to see your spending vs. limits.
              </p>
            </div>
          ) : budgetGauges.length === 0 ? (
            <div className="border border-dashed border-white/10 p-12 text-center space-y-3">
              <Target size={24} className="text-white/10 mx-auto" />
              <p className="text-[11px] text-white/30 uppercase tracking-[0.2em] font-bold">No budgets set for this month</p>
              <p className="text-[10px] text-white/20">
                Click <span className="text-[#00E599]">Set Budget</span> to define spending limits for this month.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {budgetGauges.map(({ budget, spent }) => (
                <div
                  key={`${budget.category}-${budget.month}-${budget.year}`}
                  onClick={() => {
                    setEditingBudget(budget);
                    setBudgetModalOpen(true);
                  }}
                  className="cursor-pointer"
                >
                  <BudgetGauge budget={budget} spent={spent} />
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ─── Charts + Recent Transactions ─────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <motion.div variants={item} className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#00E599] rotate-45" />
              <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white">Recent Transactions</h3>
            </div>
            <div className="border border-border">
              <DataTable columns={columns.slice(1)} data={filteredTransactions.slice(0, 5)} />
            </div>
          </motion.div>

          <motion.div variants={item} className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#00E599] rotate-45" />
              <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white">Category Breakdown</h3>
            </div>
            <div className="border border-border p-8 bg-black/40">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#000", border: "1px solid #2E2E32", borderRadius: "0px", fontSize: "10px", fontFamily: "JetBrains Mono" }}
                      itemStyle={{ color: "#FFF" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-y-4 pt-8">
                 {categoryData.map((entry, index) => (
                   <div key={entry.name} className="flex items-center gap-3">
                     <div className="w-2 h-2" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                     <div className="space-y-0">
                       <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">{entry.name}</p>
                       <p className="text-xs font-mono font-bold text-white">${entry.value.toFixed(0)}</p>
                     </div>
                   </div>
                 ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
