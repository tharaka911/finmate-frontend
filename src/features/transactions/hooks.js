import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { transactionService } from '../../api/transactions';

export const useTransactions = () => {
  const { getToken } = useAuth();
  
  // 1. Get the current transactions from cache/server
  const query = useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionService.getAll(getToken),
    staleTime: 1000 * 60 * 5,
  });

  // 2. Subscribe to the reactive blacklist
  const { data: blacklist = [] } = useQuery({
    queryKey: ['deleted-transactions-blacklist'],
    initialData: [],
    staleTime: Infinity,
  });
  
  // 3. Use standard React useMemo for filtering
  // This is the "Ultimate Fix": it is 100% reactive to changes in both
  // the server data AND the local blacklist.
  const filteredData = useMemo(() => {
    const rawData = query.data || [];
    if (blacklist.length === 0) return rawData;
    
    // Harden comparison by using String conversion
    const blacklistedSet = new Set(blacklist.map(id => String(id)));
    return rawData.filter(t => !blacklistedSet.has(String(t.id)));
  }, [query.data, blacklist]);

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

      // 2. Add to the Reactive Blacklist immediately (Atomic)
      // We convert to String to ensure consistent type-safe filtering
      const stringId = String(id);
      queryClient.setQueryData(['deleted-transactions-blacklist'], (old = []) => {
        if (old.includes(stringId)) return old;
        return [...old, stringId];
      });

      // 3. Optimistically update the main cache for good measure
      queryClient.setQueryData(['transactions'], (old) => 
        old ? old.filter((t) => String(t.id) !== stringId) : []
      );

      return { previousTotalData, deletedId: stringId };
    },
    onSuccess: (data, id, context) => {
      // Refortify the blacklist state
      queryClient.setQueryData(['deleted-transactions-blacklist'], (old = []) => {
        if (old.includes(context.deletedId)) return old;
        return [...old, context.deletedId];
      });
    },
    onError: (err, id, context) => {
      // Atomic rollback of the blacklist
      queryClient.setQueryData(['deleted-transactions-blacklist'], (old = []) => 
        old.filter(itemId => itemId !== context.deletedId)
      );
      
      if (context?.previousTotalData) {
        queryClient.setQueryData(['transactions'], context.previousTotalData);
      }
    },
    onSettled: () => {
      // Sync with server in the background
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};
