import { useState, useEffect } from "react";
import { X, Save, Terminal, DollarSign, CreditCard } from "lucide-react";
import { useAddTransaction, useUpdateTransaction } from "../../hooks/use-transactions";
import { CATEGORIES, TYPES, getCategoryLabel, getTypeLabel } from '../../utils/categories';

export default function TransactionForm({ onComplete, onCancel, initialData }) {
  const isEditing = !!initialData;
  const { mutate: addTransaction, isPending: isAdding } = useAddTransaction();
  const { mutate: updateTransaction, isPending: isUpdating } = useUpdateTransaction();
  
  const isPending = isAdding || isUpdating;

  const [formData, setFormData] = useState({
    amount: initialData?.amount || "",
    date: initialData?.date 
      ? new Date(initialData.date).toISOString().split("T")[0] 
      : new Date().toISOString().split("T")[0],
    type: initialData?.type || "CASH",
    category: initialData?.category || "GROCERY",
    notes: initialData?.notes || "",
    status: initialData?.status || "PENDING"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      amount: parseFloat(formData.amount),
    };

    if (isEditing) {
      updateTransaction({ id: initialData.id, data: payload }, {
        onSuccess: () => onComplete(),
      });
    } else {
      addTransaction(payload, {
        onSuccess: () => onComplete(),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`p-8 md:p-12 space-y-12 bg-black border ${isEditing ? 'border-white/20' : 'border-[#00E599]/20'} shadow-[0_0_50px_rgba(0,229,153,0.05)]`}>
      <div className="flex justify-between items-end border-b border-white/10 pb-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[#00E599] font-mono text-xs uppercase tracking-widest">
            <Terminal size={14} /> {isEditing ? 'EDIT_ENTRY' : 'ADD_ENTRY'}
          </div>
          <h3 className="text-3xl font-extrabold tracking-tighter text-white">
            {isEditing ? 'Modify Transaction' : 'New Transaction'}
          </h3>
        </div>
        <button type="button" onClick={onCancel} className="text-muted-foreground hover:text-white transition-colors p-2">
          <X size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Amount ($)</label>
          <input
            required
            type="number"
            step="0.01"
            placeholder="0.00"
            className="w-full bg-white/[0.03] border border-white/10 rounded-none px-4 py-4 text-2xl font-mono text-white focus:border-[#00E599] focus:ring-1 focus:ring-[#00E599]/20 outline-none transition-all placeholder:opacity-20"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Date</label>
          <input
            required
            type="date"
            className="w-full bg-white/[0.03] border border-white/10 rounded-none px-4 py-4 text-sm font-mono text-white focus:border-[#00E599] focus:ring-1 focus:ring-[#00E599]/20 outline-none transition-all"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Payment Method</label>
          <div className="grid grid-cols-2 gap-0 border border-white/10">
            {TYPES.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setFormData({ ...formData, type: t })}
                className={`flex-1 flex items-center justify-center gap-2 py-3 border transition-all text-[10px] font-bold uppercase tracking-widest ${
                  formData.type === t 
                    ? "bg-white text-black border-white" 
                    : "border-white/10 text-white/40 hover:border-white/30"
                }`}
              >
                {t === "CASH" ? <DollarSign size={14} /> : <CreditCard size={14} />}
                {getTypeLabel(t)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full bg-black border border-white/10 p-4 text-white text-sm focus:outline-none focus:border-[#00E599] transition-colors appearance-none uppercase tracking-widest font-bold"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c} className="bg-black text-white">{getCategoryLabel(c)}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2 space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Notes</label>
          <textarea
            className="w-full bg-white/[0.03] border border-white/10 rounded-none px-4 py-4 text-sm text-white focus:border-[#00E599] focus:ring-1 focus:ring-[#00E599]/20 outline-none transition-all min-h-[100px] placeholder:opacity-20"
            placeholder="Add some notes..." 
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>
      </div>

      <div className="flex gap-0 pt-6 border-t border-white/10">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 bg-white text-black font-extrabold px-10 py-5 hover:bg-[#00E599] transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs disabled:opacity-50"
        >
          <Save size={18} />
          {isPending ? 'SAVING...' : isEditing ? 'UPDATE_CHANGES' : 'SAVE_TRANSACTION'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-10 py-5 font-bold bg-white/5 hover:bg-white/10 transition-colors border-l border-white/10 text-white uppercase tracking-[0.2em] text-xs"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
