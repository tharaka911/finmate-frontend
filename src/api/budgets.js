import { apiClient } from "./client";

export const budgetService = {
  getAll: (getToken) =>
    apiClient("/budgets", { getToken }),

  upsert: (data, getToken) =>
    apiClient("/budgets", {
      method: "PUT",
      body: data,
      getToken,
    }),
};
