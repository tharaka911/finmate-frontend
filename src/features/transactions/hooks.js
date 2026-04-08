import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { transactionService } from '../../api/transactions';

export const useTransactions = () => {
  const { getToken } = useAuth();
  
  return useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionService.getAll(getToken),
    staleTime: 1000 * 60 * 5,
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
