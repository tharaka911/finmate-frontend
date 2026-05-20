import { useState, useMemo, useEffect, useRef } from "react";
import { Calendar, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MonthSelector({ transactions = [], selectedMonth, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute available months dynamically from transactions
  const monthOptions = useMemo(() => {
    const monthsSet = new Set();

    // 1. Always guarantee the current calendar month is in the dropdown
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthIndex = now.getMonth(); // 0-11
    monthsSet.add(JSON.stringify({ year: currentYear, month: currentMonthIndex }));

    // 2. Extract months from all existing transactions
    transactions.forEach((t) => {
      if (t.date) {
        const d = new Date(t.date);
        const year = d.getFullYear();
        const month = d.getMonth(); // 0-11
        monthsSet.add(JSON.stringify({ year, month }));
      }
    });

    // 3. Convert to sorted array (descending order)
    const sortedParsed = Array.from(monthsSet)
      .map((str) => JSON.parse(str))
      .sort((a, b) => {
        if (b.year !== a.year) {
          return b.year - a.year;
        }
        return b.month - a.month;
      });

    // 4. Map to value/label options
    return sortedParsed.map(({ year, month }) => {
      const value = `${year}-${String(month + 1).padStart(2, "0")}`;
      const label = new Date(year, month).toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
      return { value, label };
    });
  }, [transactions]);

  // Find label of currently selected option
  const selectedLabel = useMemo(() => {
    if (selectedMonth === "ALL") return "All Time";
    const found = monthOptions.find((opt) => opt.value === selectedMonth);
    return found ? found.label : selectedMonth;
  }, [selectedMonth, monthOptions]);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-5 py-3 bg-black/40 hover:bg-black/60 border border-white/10 hover:border-[#00E599]/30 transition-all duration-300 text-white rounded-none cursor-pointer group shadow-[0_0_20px_rgba(0,0,0,0.3)] min-w-[200px] justify-between"
      >
        <div className="flex items-center gap-3">
          <Calendar size={14} className="text-[#00E599] group-hover:scale-110 transition-transform duration-300" />
          <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.2em]">
            {selectedLabel}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <ChevronDown size={14} className="text-white/60 group-hover:text-white transition-colors duration-300" />
        </motion.div>
      </button>

      {/* Glassmorphic Dropdown List */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-1 w-64 z-[90] bg-[#050505]/95 backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden max-h-72 overflow-y-auto custom-scrollbar"
          >
            <div className="py-1 divide-y divide-white/5">
              {/* All Time Option */}
              <button
                onClick={() => handleSelect("ALL")}
                className={`w-full text-left px-5 py-3.5 flex items-center justify-between text-[10px] font-mono font-extrabold uppercase tracking-widest transition-all duration-200 cursor-pointer ${
                  selectedMonth === "ALL"
                    ? "text-[#00E599] bg-[#00E599]/5"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>All Time</span>
                {selectedMonth === "ALL" && <Check size={12} className="text-[#00E599]" />}
              </button>

              {/* Dynamic Month Options */}
              {monthOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full text-left px-5 py-3.5 flex items-center justify-between text-[10px] font-mono font-extrabold uppercase tracking-widest transition-all duration-200 cursor-pointer ${
                    selectedMonth === opt.value
                      ? "text-[#00E599] bg-[#00E599]/5"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span>{opt.label}</span>
                  {selectedMonth === opt.value && <Check size={12} className="text-[#00E599]" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
