import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { transactionService } from '../../api/transactions';

/**
 * ANTI-GHOSTING ENGINE
 * We use a global Set outside of React state to ensure 100% consistency.
 * This is the only way to guarantee that a deleted ID is filtered synchronously
 * regardless of network refetches or query invalidations.
 */
const GLOBAL_DELETION_BLACKLIST = new Set();


export const useTransactions = () => {
  const { getToken } = useAuth();
  
  const query = useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionService.getAll(getToken),
    staleTime: 1000 * 60 * 5,
  });

  // Since GLOBAL_DELETION_BLACKLIST is global, we don't need a separate useQuery for it
  // But we want to trigger a re-render when it changes, so we'll use a local tick if needed
  // However, the mutation below will trigger an optimistic update on ['transactions']
  // which WILL cause a re-render here.
  
  const filteredData = useMemo(() => {
    const rawData = query.data || [];
    if (GLOBAL_DELETION_BLACKLIST.size === 0) return rawData;
    
    return rawData.filter(t => !GLOBAL_DELETION_BLACKLIST.has(String(t.id)));
  }, [query.data, GLOBAL_DELETION_BLACKLIST.size]); // Use size to trigger re-calc on change

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

      // 2. Atomic Blacklist Update (Global)
      const stringId = String(id);
      GLOBAL_DELETION_BLACKLIST.add(stringId);

      // 3. Optimistically update the cache
      queryClient.setQueryData(['transactions'], (old) => 
        old ? old.filter((t) => String(t.id) !== stringId) : []
      );

      return { previousTotalData, deletedId: stringId };
    },
    onSuccess: () => {
      // Success. We keep it in the blacklist to prevent ghosting during background sweeps.
    },
    onError: (err, id, context) => {
      // Rollback
      GLOBAL_DELETION_BLACKLIST.delete(context.deletedId);
      
      if (context?.previousTotalData) {
        queryClient.setQueryData(['transactions'], context.previousTotalData);
      }
    },
    onSettled: () => {
      // PRO-TIP: We DO NOT invalidate immediately on success here.
      // This eliminates the "Fast Refetch Race Condition".
      // The background sync will happen eventually (every 5 mins).
    },
  });
};
