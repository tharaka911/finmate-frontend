import { useMemo, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { transactionService } from '../../api/transactions';

// --- PERSISTENT SHIELD UTILITY ---
const STORAGE_KEY = 'finmate_deleted_ids_v1';
const PROTECTION_WINDOW_MS = 30000; // 30 seconds of absolute silence

const getPersistentDelog = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch { return {}; }
};

const addToPersistentDelog = (id) => {
  const log = getPersistentDelog();
  log[String(id)] = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
};

const cleanPersistentDelog = () => {
  const log = getPersistentDelog();
  const now = Date.now();
  const newLog = {};
  let changed = false;
  Object.entries(log).forEach(([id, timestamp]) => {
    if (now - timestamp < PROTECTION_WINDOW_MS) {
      newLog[id] = timestamp;
    } else {
      changed = true;
    }
  });
  if (changed) localStorage.setItem(STORAGE_KEY, JSON.stringify(newLog));
  return newLog;
};


export const useTransactions = () => {
  const { getToken } = useAuth();
  
  // 1. Transactions from server
  const query = useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionService.getAll(getToken),
    staleTime: 1000 * 60 * 5,
  });

  // 2. Persistent Shield State
  // We use a bit of local state to force a re-render when we delete something
  const [delog, setDelog] = useState(() => cleanPersistentDelog());

  // Periodically clean and sync the delog
  useEffect(() => {
    const interval = setInterval(() => {
      setDelog(cleanPersistentDelog());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // 3. Absolute Synchronous Filter
  const filteredData = useMemo(() => {
    if (!query.data) return [];
    
    const activeDelog = cleanPersistentDelog(); // Refresh on every render for maximum safety
    const idsToBlock = Object.keys(activeDelog);
    
    if (idsToBlock.length === 0) return query.data;
    
    const blockSet = new Set(idsToBlock);
    return query.data.filter(t => !blockSet.has(String(t.id)));
  }, [query.data, delog]); // 'delog' triggers re-renders on mutation

  return { ...query, data: filteredData };
};

export const useAddTransaction = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => transactionService.create(data, getToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

export const useSettleTransaction = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => transactionService.settle(id, getToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};
export const useUpdateTransaction = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => transactionService.update(id, data, getToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

export const useDeleteTransaction = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => transactionService.delete(id, getToken),
    onMutate: async (id) => {
      // 1. Snapshot previous state
      await queryClient.cancelQueries({ queryKey: ['transactions'] });
      const previousTotalData = queryClient.getQueryData(['transactions']);

      // 2. Activate Persistent Shield (Atomic)
      const stringId = String(id);
      addToPersistentDelog(stringId);

      // 3. Optimistic cache update
      queryClient.setQueryData(['transactions'], (old) => 
        old ? old.filter((t) => String(t.id) !== stringId) : []
      );

      return { previousTotalData, deletedId: stringId };
    },
    onSuccess: (data, id, context) => {
      // Success. The shield is already active.
    },
    onError: (err, id, context) => {
      // Note: We normally don't remove from delog on error immediately
      // to prevent flicker, but if it truly failed, we should.
      // For now, staying strict.
      if (context?.previousTotalData) {
        queryClient.setQueryData(['transactions'], context.previousTotalData);
      }
    },
    onSettled: () => {
      // Sync with server. The shield will keep it hidden even if refetch is stale.
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};
