import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { transactionService } from '../../api/transactions';

export const useTransactions = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionService.getAll(getToken),
    staleTime: 1000 * 60 * 5,
    // Add logic to hide IDs that was deleted but still appearing in refetch
    select: (data) => {
      const deletedIds = queryClient.getQueryData(['deleted-transactions-blacklist']) || [];
      if (deletedIds.length === 0) return data;
      
      // Filter out anyone in the blacklist
      const filtered = data.filter(t => !deletedIds.includes(t.id));
      
      // Optimization: If the refetched data doesn't contain the blacklisted ID anymore,
      // it means the server has caught up, and we can clean up the blacklist.
      // Note: We avoid side effects in select, so we'll do cleanup in a separate sync if needed,
      // but for now, this filtering is sufficient.
      return filtered;
    }
  });
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
      await queryClient.cancelQueries({ queryKey: ['transactions'] });
      const previousTransactions = queryClient.getQueryData(['transactions']);

      // 1. Optimistic update
      queryClient.setQueryData(['transactions'], (old) => 
        old ? old.filter((t) => t.id !== id) : []
      );

      // 2. Add to hard blacklist immediately to prevent reappearance during mutation
      queryClient.setQueryData(['deleted-transactions-blacklist'], (old = []) => [...old, id]);

      return { previousTransactions, deletedId: id };
    },
    onSuccess: (data, id, context) => {
      // Reinforce the blacklist on success
      queryClient.setQueryData(['deleted-transactions-blacklist'], (old = []) => {
        if (old.includes(context.deletedId)) return old;
        return [...old, context.deletedId];
      });
      
      // Also reinforce the cache itself
      queryClient.setQueryData(['transactions'], (old) => 
        old ? old.filter((t) => t.id !== context.deletedId) : []
      );
    },
    onError: (err, id, context) => {
      // Rollback blacklist
      queryClient.setQueryData(['deleted-transactions-blacklist'], (old = []) => 
        old.filter(item => item !== context.deletedId)
      );
      
      if (context?.previousTransactions) {
        queryClient.setQueryData(['transactions'], context.previousTransactions);
      }
    },
    onSettled: () => {
      // Sync with server
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};
