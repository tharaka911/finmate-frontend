import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { budgetService } from '../api/budgets';

/**
 * Fetch all budgets for the current user.
 */
export const useBudgets = () => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['budgets'],
    queryFn: () => budgetService.getAll(getToken),
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Create or update a single budget entry.
 * Payload: { amount, category, month, year }
 */
export const useUpsertBudget = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => budgetService.upsert(data, getToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
};
