# App Providers
This folder is for React Context Providers that need to wrap your entire application.

- If you add a `ThemeProvider` or a `ToastProvider`, they go here.
- This keeps your `main.jsx` clean by delegating the complex "Provider Tree" logic.

## Logic Example:
```jsx
export function AppProvider({ children }) {
  return (
    <QueryClientProvider client={client}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
```
