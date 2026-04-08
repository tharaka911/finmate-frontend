import { useState } from "react";
import { Plus, Filter, Search, CheckCircle2, Terminal, Edit3, Trash2 } from "lucide-react";
import DataTable from "../components/ui/DataTable";
import Form from "../components/ui/Form";
import { Skeleton, TableSkeleton } from "../components/ui/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { 
  useTransactions, 
  useSettleTransaction, 
  useDeleteTransaction 
} from "../features/transactions/hooks";
import DeleteConfirmationModal from "../features/transactions/components/DeleteConfirmationModal";

export default function Transactions() {
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const { data: transactions = [], isLoading } = useTransactions();
  const { mutate: settleTransaction } = useSettleTransaction();
  const { mutate: deleteTransaction } = useDeleteTransaction();

  const handleDelete = (t) => {
    setTransactionToDelete(t);
  };

  const confirmDelete = () => {
    if (transactionToDelete) {
      deleteTransaction(transactionToDelete.id, {
        onSuccess: () => setTransactionToDelete(null)
      });
    }
  };

  const columns = [
    { header: "Date", accessorKey: "date", cell: info => <span className="font-mono text-xs opacity-70 group-hover:opacity-100">{new Date(info.getValue()).toLocaleDateString()}</span> },
    { header: "Amount", accessorKey: "amount", cell: info => (
      <span className="font-mono text-white text-base font-bold">${info.getValue().toFixed(2)}</span>
    )},
    { header: "Type", accessorKey: "type", cell: info => (
      <span className={`text-[10px] uppercase font-bold tracking-[0.2em] px-2 py-1 border border-current ${info.getValue() === "CASH" ? "text-[#00E599] border-[#00E599]/30" : "text-white opacity-40 border-white/10"}`}>
        {info.getValue()}
      </span>
    )},
    { header: "Category", accessorKey: "category", cell: info => (
      <span className="text-[10px] uppercase font-bold tracking-widest text-[#9B9B9B]">{info.getValue()}</span>
    )},
    { header: "Status", accessorKey: "status", cell: info => (
      <span className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${info.getValue() === "SETTLED" ? "text-white/30" : "text-amber-400"}`}>
        {info.getValue() === "SETTLED" ? <CheckCircle2 size={12} /> : <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_5px_rgba(251,191,36,0.5)] animate-pulse" />}
        {info.getValue()}
      </span>
    )},
    {
      header: "Ops",
      cell: (info) => {
        const t = info.row.original;
        return (
          <div className="flex items-center gap-2">
            {t.type === "CREDIT" && t.status === "PENDING" && (
              <button 
                onClick={() => settleTransaction(t.id)}
                title="Settle"
                className="p-2 text-[#00E599] hover:bg-[#00E599] hover:text-black transition-all border border-[#00E599]/20"
              >
                <CheckCircle2 size={14} />
              </button>
            )}
            <button 
              onClick={() => setEditingTransaction(t)}
              title="Edit"
              className="p-2 text-white/40 hover:text-white hover:bg-white/10 transition-all border border-white/5"
            >
              <Edit3 size={14} />
            </button>
            <button 
              onClick={() => handleDelete(t)}
              title="Delete"
              className="p-2 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all border border-red-500/10"
            >
              <Trash2 size={14} />
            </button>
          </div>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-12">
        <div className="flex justify-between items-end border-b border-border pb-8">
            <div className="space-y-4">
                <Skeleton className="h-10 w-48 bg-white/5" />
                <Skeleton className="h-4 w-64 bg-white/5" />
            </div>
            <Skeleton className="h-12 w-40 bg-white/5" />
        </div>
        <TableSkeleton />
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
      className="space-y-12 pb-20"
    >
      <motion.div variants={item} className="flex flex-col md:flex-row justify-between items-start border-b border-white/5 pb-8 gap-6">
        <div className="space-y-4">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-white">Transactions</h2>
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-muted-foreground flex items-center gap-2">
            <Terminal size={12} className="text-[#00E599]" /> Data stream
          </p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-white text-black font-extrabold px-8 py-3 hover:bg-[#00E599] transition-all uppercase tracking-widest text-[10px]"
        >
          <Plus size={16} strokeWidth={3} />
          {showForm ? 'Cancel Entry' : 'Append Record'}
        </button>
      </motion.div>

      <AnimatePresence>
        {(showForm || editingTransaction || transactionToDelete) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 md:p-8"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-4xl max-h-full overflow-y-auto custom-scrollbar shadow-[0_0_100px_rgba(0,229,153,0.1)]"
            >
              {transactionToDelete ? (
                <DeleteConfirmationModal 
                  amount={transactionToDelete.amount}
                  category={transactionToDelete.category}
                  onConfirm={confirmDelete}
                  onCancel={() => setTransactionToDelete(null)}
                />
              ) : (
                <Form 
                  initialData={editingTransaction}
                  onComplete={() => {
                    setShowForm(false);
                    setEditingTransaction(null);
                  }} 
                  onCancel={() => {
                    setShowForm(false);
                    setEditingTransaction(null);
                  }} 
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={item} className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-0 border border-border divide-y lg:divide-y-0 lg:divide-x divide-border">
          <div className="flex items-center gap-4 flex-1 px-6 py-4 bg-black/50">
             <Search size={14} className="text-muted-foreground" />
             <input 
               type="text" 
               placeholder="QUERY TRANSACTION LOGS..." 
               className="bg-transparent border-none focus:ring-0 text-[10px] font-bold uppercase tracking-[0.1em] w-full placeholder:opacity-30"
             />
          </div>
          <div className="flex divide-x divide-border">
            <button className="flex items-center gap-3 px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-[#00E599] transition-colors">
              <Filter size={12} /> Sort
            </button>
            <button className="flex items-center gap-3 px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-[#00E599] transition-colors">
              Category
            </button>
          </div>
        </div>

        <div className="border border-border">
            <DataTable columns={columns} data={transactions} />
        </div>
      </motion.div>
    </motion.div>
  );
}
