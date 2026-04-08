# API Layer
This folder contains the core logic for communicating with the backend.

- `client.js`: A base fetch wrapper that automatically includes authentication tokens.
- `*.js`: Domain-specific services (e.g., `transactions.js`) that use the client.

## Example Usage:
```javascript
import { apiClient } from './client';
export const myService = () => apiClient('/my-endpoint');
```
