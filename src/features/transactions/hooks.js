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

      // 2. Optimistically update the cache
      queryClient.setQueryData(['transactions'], (old) => 
        old ? old.filter((t) => t.id !== id) : []
      );

      return { previousTotalData, deletedId: id };
    },
    onSuccess: (data, id, context) => {
      // Reinforce the deletion in cache on success
      queryClient.setQueryData(['transactions'], (old) => 
        old ? old.filter((t) => t.id !== context.deletedId) : []
      );
    },
    onError: (err, id, context) => {
      // Rollback on error
      if (context?.previousTotalData) {
        queryClient.setQueryData(['transactions'], context.previousTotalData);
      }
    },
    onSettled: () => {
      // Small delay to ensure DB sync before refetching
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
      }, 500);
    },
  });
};
