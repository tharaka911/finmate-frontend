import { apiClient } from './client';

export const transactionService = {
  getAll: (getToken) => apiClient('/transactions', { getToken }),
  
  create: (data, getToken) => apiClient('/transactions', {
    method: 'POST',
    body: data,
    getToken,
  }),
  
  settle: (id, getToken) => apiClient(`/transactions/${id}/settle`, {
    method: 'PATCH',
    getToken,
  }),
};
