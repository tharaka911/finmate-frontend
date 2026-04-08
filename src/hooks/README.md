# Global Hooks
This folder is for reusable React logic that is **NOT** tied to a specific feature.

## Example: `useLocalStorage.js`
```javascript
import { useState } from 'react';

export function useLocalStorage(key, initialValue) {
  // Logic to read/write from local storage...
}
```
