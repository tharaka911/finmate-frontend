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

  update: (id, data, getToken) => apiClient(`/transactions/${id}`, {
    method: 'PATCH',
    body: data,
    getToken,
  }),

  delete: (id, getToken) => apiClient(`/transactions/${id}`, {
    method: 'DELETE',
    getToken,
  }),
};
