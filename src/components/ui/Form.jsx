import { useState, useEffect } from "react";
import { X, Save, Terminal } from "lucide-react";
import { useAddTransaction, useUpdateTransaction } from "../../features/transactions/hooks";

const CATEGORIES = ["GROCERY", "FOOD", "FUN", "VEHICLE", "OTHER"];
const TYPES = ["CASH", "CREDIT"];

export default function Form({ onComplete, onCancel, initialData }) {
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
            <Terminal size={14} /> {isEditing ? 'UPDATE_ENTITY_RECORD' : 'NEW_ENTITY_RECORD'}
          </div>
          <h3 className="text-3xl font-extrabold tracking-tighter text-white">
            {isEditing ? 'Modify Transaction' : 'Capture Transaction'}
          </h3>
        </div>
        <button type="button" onClick={onCancel} className="text-muted-foreground hover:text-white transition-colors p-2">
          <X size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Magnitude ($)</label>
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
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Timestamp</label>
          <input
            required
            type="date"
            className="w-full bg-white/[0.03] border border-white/10 rounded-none px-4 py-4 text-sm font-mono text-white focus:border-[#00E599] focus:ring-1 focus:ring-[#00E599]/20 outline-none transition-all"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Transaction Mode</label>
          <div className="grid grid-cols-2 gap-0 border border-white/10">
            {TYPES.map(t => (
              <button 
                key={t}
                type="button"
                onClick={() => setFormData({ ...formData, type: t })}
                className={`py-4 text-[10px] font-bold uppercase tracking-widest transition-colors ${formData.type === t ? "bg-white text-black" : "bg-transparent text-white opacity-40 hover:opacity-100 hover:bg-white/5"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Classification</label>
          <select
            className="w-full bg-white/[0.03] border border-white/10 rounded-none px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-white focus:border-[#00E599] outline-none transition-all appearance-none cursor-pointer"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-black text-white">{c}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2 space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Annotations</label>
          <textarea
            className="w-full bg-white/[0.03] border border-white/10 rounded-none px-4 py-4 text-sm text-white focus:border-[#00E599] focus:ring-1 focus:ring-[#00E599]/20 outline-none transition-all min-h-[100px] placeholder:opacity-20"
            placeholder="ADDITIONAL_DATA_ENTRY..."
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
          {isPending ? 'COMMITTING...' : 'COMMIT_TRANSACTION'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-10 py-5 font-bold bg-white/5 hover:bg-white/10 transition-colors border-l border-white/10 text-white uppercase tracking-[0.2em] text-xs"
        >
          Abort
        </button>
      </div>
    </form>
  );
}
