# Page Layouts
This folder contains high-level wrappers that define the structure of your application's routes.

- `RootLayout.jsx`: The main wrapper for all authenticated pages. It contains the `<Header />` and the `<Outlet />` (where the current page is rendered).

## Difference between `src/layouts` and `src/components/layout`:
- `src/layouts`: Wraps **multiple pages** via Routing.
- `src/components/layout`: Is a **component** used *inside* a layout (like a Header).
