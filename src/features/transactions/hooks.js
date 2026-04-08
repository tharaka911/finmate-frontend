import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { transactionService } from '../../api/transactions';

export const useTransactions = () => {
  const { getToken } = useAuth();
  
  return useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionService.getAll(getToken),
    // Refresh data every 5 minutes or on window focus
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};
