# Transaction Hooks Guide 🚀

This guide explains how to use the custom hooks for managing transactions in the FinMate application. These hooks use **TanStack Query (React Query)** to handle data fetching, caching, and synchronization.

## 1. `useTransactions`
Used for fetching and reading the list of transactions.

### How it works:
- Fetches data from `/transactions`.
- Automatically handles the **Loading** state.
- **Caches** the data for 5 minutes (data won't re-fetch unless it's "stale").
- Automatically re-fetches when you add or update a transaction (via invalidation).

### Example:
```jsx
import { useTransactions } from "../features/transactions/hooks";
import { Skeleton } from "../components/ui/Skeleton";

function TransactionList() {
  const { data: transactions, isLoading, error } = useTransactions();

  if (isLoading) return <Skeleton className="h-20 w-full" />;
  if (error) return <div>Error loading transactions: {error.message}</div>;

  return (
    <ul>
      {transactions.map(t => (
        <li key={t.id}>{t.category}: ${t.amount}</li>
      ))}
    </ul>
  );
}
```

---

## 2. `useAddTransaction`
Used for creating a new transaction record.

### How it works:
- Sends a `POST` request to the server.
- Provides `isPending` state so you can show a loading spinner on your "Submit" button.
- **Automatic Refresh**: Once the transaction is created, it calls `invalidateQueries(['transactions'])`. This tells the `useTransactions` hook to throw away its old data and fetch the new list immediately.

### Example:
```jsx
const { mutate: addTransaction, isPending } = useAddTransaction();

const handleSubmit = (formData) => {
  addTransaction(formData, {
    onSuccess: () => {
      console.log("Transaction added!");
      // You can close a modal or clear a form here
    }
  });
};
```

---

## 3. `useSettleTransaction`
Used for updating a transaction's status to "SETTLED".

### How it works:
- Sends a `PATCH` request to settle a specific transaction by ID.
- Automatically refreshes the transaction list on success.

### Example:
```jsx
const { mutate: settleTransaction } = useSettleTransaction();

return (
  <button onClick={() => settleTransaction(transactionId)}>
    Mark as Settled
  </button>
);
```

---

## Why we use this pattern (Best Practices)

1. **Separation of Concerns**: Your components focus on the **UI**, while the hooks handle the **Logic** and network requests.
2. **Global State**: Since the data is cached, any component that calls `useTransactions()` will get the same data. No need for complex "Prop Drilling" or Redux.
3. **Optimistic Feel**: The app feels faster because it knows exactly when to refresh the data without the user having to refresh the page.

> [!TIP]
> You can inspect the "Freshness" of your data and manualy trigger refreshes using the **React Query Devtools** icon at the bottom left of your screen during development.
