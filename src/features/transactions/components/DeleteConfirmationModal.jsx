import { motion } from "framer-motion";
import { AlertTriangle, Trash2, X, Terminal } from "lucide-react";

export default function DeleteConfirmationModal({ onConfirm, onCancel, amount, category }) {
  return (
    <div className="p-8 md:p-12 space-y-10 bg-black border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.05)]">
      <div className="flex justify-between items-start border-b border-white/10 pb-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-red-500 font-mono text-xs uppercase tracking-widest">
            <AlertTriangle size={14} /> DANGER_ZONE.CRITICAL_ACTION
          </div>
          <h3 className="text-3xl font-extrabold tracking-tighter text-white">Destroy Record?</h3>
        </div>
        <button type="button" onClick={onCancel} className="text-muted-foreground hover:text-white transition-colors p-2">
          <X size={20} />
        </button>
      </div>

      <div className="space-y-6">
        <div className="bg-red-500/5 border-l-2 border-red-500 p-6 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 opacity-60">Entity Metadata</p>
          <div className="flex justify-between items-baseline">
            <span className="text-2xl font-mono text-white font-bold">${amount.toFixed(2)}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{category}</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          You are about to purge this transaction from the telemetry stream. 
          <span className="text-white font-bold"> This action cannot be reversed.</span> All associated analytical data will be permanently deleted.
        </p>
      </div>

      <div className="flex gap-4 pt-6 border-t border-white/10">
        <button
          onClick={onConfirm}
          className="flex-1 bg-red-600 text-white font-extrabold px-8 py-5 hover:bg-red-500 transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs shadow-[0_0_20px_rgba(239,68,68,0.2)]"
        >
          <Trash2 size={18} />
          Confirm_Destroy
        </button>
        <button
          onClick={onCancel}
          className="flex-1 px-8 py-5 font-bold bg-white/5 hover:bg-white/10 transition-colors border border-white/10 text-white uppercase tracking-[0.2em] text-xs"
        >
          Abort_Action
        </button>
      </div>
      
      <div className="flex items-center gap-2 text-[8px] font-mono text-white/20 uppercase tracking-[0.3em]">
        <Terminal size={10} /> SYS.LOG: PENDING_CONFIRMATION_FROM_OPERATOR
      </div>
    </div>
  );
}
