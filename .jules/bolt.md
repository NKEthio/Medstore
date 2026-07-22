# Bolt's Journal

⚡ A performance-obsessed agent's learnings in the MedStore codebase.

## 2026-07-22 - Codebase Architecture Discovery
**Learning:** The application uses React 19 + Vite and does not have built-in state managers (like Redux or Zustand). Instead, it relies heavily on React Context (`AuthContext` and `CartContext`) and client-side calculations (such as dynamic category extraction and product filtering inside render loops). This makes component-level rendering optimizations (such as `useMemo`, `useCallback`, and `React.memo`) highly effective since context or parent state changes can easily trigger full tree re-renders.
**Action:** Focus on memoizing expensive calculations and rendering-heavy components (like `ProductCard` and dynamic category listings) to avoid unnecessary overhead during state updates.
