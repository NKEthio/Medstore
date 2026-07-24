# Bolt's Performance Journal

## 2025-03-03 - Parallel Privilege Verification & Short-circuiting Fallback Admins
**Learning:** Sequential async awaits on Firebase auth (custom claims fetch and Firestore document get) cause a noticeable delay in authentication and privilege resolution on application load. Short-circuiting network requests by synchronously checking fallback admin emails, and parallelizing custom claims and document checks with `Promise.all` for other users, significantly speeds up initialization.
**Action:** Always group unrelated asynchronous queries (like token/document fetches) into parallel operations using `Promise.all` or `Promise.allSettled`, and utilize synchronous local configurations to bypass expensive remote calls whenever possible.

## 2025-03-03 - Memoizing Category Lists & Catalog Filters in React
**Learning:** Dynamically mapping arrays and constructing `Set` instances for categories and filtered items on every single component render can be a major O(N) performance bottleneck during heavy updates. Wrapping these operations in `useMemo` keeps UI interactions light and snappy.
**Action:** Use `useMemo` to cache any O(N) or Set-constructing transformations on large state arrays that do not change frequently.
