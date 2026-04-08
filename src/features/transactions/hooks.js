import { useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { transactionService } from '../../api/transactions';

export const useTransactions = () => {
  const { getToken } = useAuth();
  
  // 1. Transactions from server
  const query = useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionService.getAll(getToken),
    staleTime: 1000 * 60 * 5,
  });

  // 2. Safeguard Buffer (Reactive)
  // This contains IDs that we want to hide NO MATTER WHAT for a short period.
  const { data: buffer = [] } = useQuery({
    queryKey: ['deleted-ids-buffer'],
    initialData: [],
    staleTime: Infinity,
  });

  // 3. Synchronous Filter
  const filteredData = useMemo(() => {
    if (!query.data) return [];
    if (buffer.length === 0) return query.data;
    
    const bufferSet = new Set(buffer.map(id => String(id)));
    return query.data.filter(t => !bufferSet.has(String(t.id)));
  }, [query.data, buffer]);

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

      // 2. Add to Safeguard Buffer (Atomic)
      const stringId = String(id);
      queryClient.setQueryData(['deleted-ids-buffer'], (old = []) => {
        if (old.includes(stringId)) return old;
        return [...old, stringId];
      });

      // 3. Set a 10s Self-Cleaning Timeout
      setTimeout(() => {
        queryClient.setQueryData(['deleted-ids-buffer'], (old = []) => 
          old.filter(itemId => itemId !== stringId)
        );
      }, 10000);

      // 4. Optimistic update
      queryClient.setQueryData(['transactions'], (old) => 
        old ? old.filter((t) => String(t.id) !== stringId) : []
      );

      return { previousTotalData, deletedId: stringId };
    },
    onSuccess: (data, id, context) => {
      // Reinforce buffer on success
      queryClient.setQueryData(['deleted-ids-buffer'], (old = []) => {
        if (old.includes(context.deletedId)) return old;
        return [...old, context.deletedId];
      });
    },
    onError: (err, id, context) => {
      // Emergency rollback on failure
      queryClient.setQueryData(['deleted-ids-buffer'], (old = []) => 
        old.filter(itemId => itemId !== context.deletedId)
      );
      
      if (context?.previousTotalData) {
        queryClient.setQueryData(['transactions'], context.previousTotalData);
      }
    },
    onSettled: () => {
      // Sync with server (Safeguard keeps it hidden)
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};
