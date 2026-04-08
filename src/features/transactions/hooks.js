import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { transactionService } from '../../api/transactions';

export const useTransactions = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  // 1. Reactive subscription to the blacklist
  // This ensures that any component using useTransactions() will re-render
  // the MOMENT an ID is added to the blacklist, even before a refetch.
  const { data: blacklist = [] } = useQuery({
    queryKey: ['deleted-transactions-blacklist'],
    initialData: [],
    staleTime: Infinity, // Keep it forever or manage manually
  });
  
  return useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionService.getAll(getToken),
    staleTime: 1000 * 60 * 5,
    // The select function is now "reactive" because it depends on the blacklist
    // which is returned from the hook above.
    select: (data) => {
      if (!data) return [];
      if (blacklist.length === 0) return data;
      return data.filter(t => !blacklist.includes(t.id));
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
      // 1. Snapshot previous state
      await queryClient.cancelQueries({ queryKey: ['transactions'] });
      const previousTotalData = queryClient.getQueryData(['transactions']);

      // 2. Add to the Reactive Blacklist immediately (Atomic)
      queryClient.setQueryData(['deleted-transactions-blacklist'], (old = []) => {
        if (old.includes(id)) return old;
        return [...old, id];
      });

      // 3. Optimistically update the main cache for good measure
      queryClient.setQueryData(['transactions'], (old) => 
        old ? old.filter((t) => t.id !== id) : []
      );

      return { previousTotalData, deletedId: id };
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
