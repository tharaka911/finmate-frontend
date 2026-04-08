import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from "recharts";
import { CreditCard, Wallet, Activity } from "lucide-react";
import DataTable from "../components/ui/DataTable";
import { Skeleton } from "../components/ui/Skeleton";
import { motion } from "framer-motion";
import { useTransactions } from "../features/transactions/hooks";

const COLORS = ["#00E599", "#FFFFFF", "#2E2E32", "#4B4B4F", "#1A1A1A"];

export default function Dashboard() {
  const { data: transactions = [], isLoading } = useTransactions();

  const totalSpent = transactions.reduce((acc, curr) => acc + curr.amount, 0);
  const cashSpent = transactions.filter(t => t.type === "CASH").reduce((acc, curr) => acc + curr.amount, 0);
  const creditSpent = transactions.filter(t => t.type === "CREDIT").reduce((acc, curr) => acc + curr.amount, 0);

  const categoryData = Object.entries(
    transactions.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const columns = [
    { header: "Date", accessorKey: "date", cell: info => <span className="font-mono text-xs opacity-70">{new Date(info.getValue()).toLocaleDateString()}</span> },
    { header: "Category", accessorKey: "category", cell: info => <span className="text-xs font-bold uppercase tracking-tighter opacity-80">{info.getValue()}</span> },
    { header: "Type", accessorKey: "type", cell: info => (
      <span className={`text-[10px] font-bold uppercase tracking-widest ${info.getValue() === "CASH" ? "text-[#00E599]" : "text-white opacity-40"}`}>
        {info.getValue()}
      </span>
    )},
    { header: "Amount", accessorKey: "amount", cell: info => (
      <span className="font-mono text-sm font-bold text-white">${info.getValue().toFixed(2)}</span>
    )},
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
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-16 pb-20"
    >
      <motion.div variants={item} className="space-y-4">
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white flex flex-wrap items-center gap-4">
           Analytics <span className="text-[10px] font-mono text-[#00E599] border border-[#00E599]/30 px-2 py-1 rounded-sm uppercase tracking-widest animate-pulse">Live</span>
        </h2>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Real-time financial telemetry</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 border border-border divide-y md:divide-y-0 md:divide-x divide-border bg-black/50 overflow-hidden">
        <motion.div variants={item} className="p-8 space-y-6 hover:bg-white/[0.02] transition-colors group">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Total Throughput</span>
            <Activity size={14} className="group-hover:text-[#00E599] transition-colors" />
          </div>
          <div className="space-y-1">
            <p className="text-5xl font-mono font-bold tracking-tighter text-white">
              <span className="text-[#00E599] text-3xl font-light mr-1">$</span>
              {totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className="h-[2px] bg-[#00E599]/20 w-full overflow-hidden">
                <motion.div 
                    initial={{ x: "-100%" }}
                    animate={{ x: "0%" }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-[#00E599] w-2/3 shadow-[0_0_10px_#00E599]" 
                />
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={item} className="p-8 space-y-6 hover:bg-white/[0.02] transition-colors group">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Liquid Assets</span>
            <Wallet size={14} className="group-hover:text-white transition-colors" />
          </div>
          <p className="text-5xl font-mono font-bold tracking-tighter text-white">
            <span className="opacity-20 text-3xl font-light mr-1">$</span>
            {cashSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </motion.div>

        <motion.div variants={item} className="p-8 space-y-6 hover:bg-white/[0.02] transition-colors group">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Credit Exposure</span>
            <CreditCard size={14} className="group-hover:text-white transition-colors" />
          </div>
          <p className="text-5xl font-mono font-bold tracking-tighter text-white">
             <span className="opacity-20 text-3xl font-light mr-1">$</span>
             {creditSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <motion.div variants={item} className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-[#00E599] rotate-45" />
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white">Distribution</h3>
          </div>
          <div className="border border-border">
            <DataTable columns={columns.slice(1)} data={transactions.slice(0, 5)} />
          </div>
        </motion.div>

        <motion.div variants={item} className="lg:col-span-5 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-[#00E599] rotate-45" />
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white">Spectral Analysis</h3>
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
  );
}
