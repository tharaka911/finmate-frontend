import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Target, ChevronDown } from "lucide-react";
import { EXPENSE_CATEGORIES, getCategoryLabel } from "../../utils/categories";
import { useUpsertBudget } from "../../hooks/use-budgets";

const CURRENT_MONTH = new Date().getMonth() + 1;
const CURRENT_YEAR = new Date().getFullYear();

const YEARS = Array.from({ length: 3 }, (_, i) => CURRENT_YEAR - 1 + i);
const MONTHS = [
  { value: 1, label: "January" }, { value: 2, label: "February" },
  { value: 3, label: "March" }, { value: 4, label: "April" },
  { value: 5, label: "May" }, { value: 6, label: "June" },
  { value: 7, label: "July" }, { value: 8, label: "August" },
  { value: 9, label: "September" }, { value: 10, label: "October" },
  { value: 11, label: "November" }, { value: 12, label: "December" },
];

export default function BudgetModal({ isOpen, onClose, prefillMonth, prefillYear, existingBudget }) {
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState(prefillMonth ?? CURRENT_MONTH);
  const [year, setYear] = useState(prefillYear ?? CURRENT_YEAR);

  const { mutate: upsertBudget, isPending, isSuccess, reset } = useUpsertBudget();

  // When the modal opens with an existing budget, pre-fill the form
  useEffect(() => {
    if (existingBudget) {
      setCategory(existingBudget.category);
      setAmount(String(existingBudget.amount));
      setMonth(existingBudget.month);
      setYear(existingBudget.year);
    }
  }, [existingBudget]);

  // Reset form on close
  useEffect(() => {
    if (!isOpen) {
      setCategory(EXPENSE_CATEGORIES[0]);
      setAmount("");
      setMonth(prefillMonth ?? CURRENT_MONTH);
      setYear(prefillYear ?? CURRENT_YEAR);
      reset();
    }
  }, [isOpen]);

  // Auto-close after success
  useEffect(() => {
    if (isSuccess) {
      const t = setTimeout(() => {
        onClose();
      }, 900);
      return () => clearTimeout(t);
    }
  }, [isSuccess, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) return;
    upsertBudget({ category, amount: parsed, month: Number(month), year: Number(year) });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal panel */}
          <motion.div
            key="modal"
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md bg-[#0a0a0e] border border-white/10 shadow-[0_0_60px_rgba(0,229,153,0.08)] overflow-hidden"
              initial={{ y: 20, scale: 0.97 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <Target size={14} className="text-[#00E599]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white">
                    {existingBudget ? "Edit Budget" : "Set Budget"}
                  </span>
                </div>
                <button
                  id="budget-modal-close"
                  onClick={onClose}
                  className="text-white/30 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {/* Category */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      id="budget-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full appearance-none bg-white/5 border border-white/10 text-white text-xs font-mono px-4 py-3 focus:outline-none focus:border-[#00E599]/50 transition-colors cursor-pointer"
                    >
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat} className="bg-[#111]">
                          {getCategoryLabel(cat)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                  </div>
                </div>

                {/* Month + Year row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Month</label>
                    <div className="relative">
                      <select
                        id="budget-month"
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                        className="w-full appearance-none bg-white/5 border border-white/10 text-white text-xs font-mono px-4 py-3 focus:outline-none focus:border-[#00E599]/50 transition-colors cursor-pointer"
                      >
                        {MONTHS.map((m) => (
                          <option key={m.value} value={m.value} className="bg-[#111]">{m.label}</option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Year</label>
                    <div className="relative">
                      <select
                        id="budget-year"
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="w-full appearance-none bg-white/5 border border-white/10 text-white text-xs font-mono px-4 py-3 focus:outline-none focus:border-[#00E599]/50 transition-colors cursor-pointer"
                      >
                        {YEARS.map((y) => (
                          <option key={y} value={y} className="bg-[#111]">{y}</option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
                    Monthly Limit
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 font-mono text-sm">$</span>
                    <input
                      id="budget-amount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      required
                      className="w-full bg-white/5 border border-white/10 text-white text-sm font-mono pl-8 pr-4 py-3 focus:outline-none focus:border-[#00E599]/50 transition-colors placeholder:text-white/20"
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  id="budget-submit"
                  type="submit"
                  disabled={isPending || isSuccess}
                  className="w-full py-3 font-mono text-xs font-bold uppercase tracking-[0.2em] transition-all duration-200 disabled:opacity-50"
                  style={{
                    background: isSuccess
                      ? "linear-gradient(90deg, #00E599, #00b37e)"
                      : "linear-gradient(90deg, #00E599, #00b37e)",
                    color: "#000",
                    boxShadow: "0 0 20px rgba(0,229,153,0.3)",
                  }}
                >
                  {isPending ? "Saving…" : isSuccess ? "✓ Saved!" : existingBudget ? "Update Budget" : "Set Budget"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
