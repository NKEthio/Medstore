# Bolt's Performance Journal

## 2025-03-04 - Authentication & Admin State Recovery Network Bottleneck
**Learning:** Sequential asynchronous network requests during `onAuthStateChanged` (fetching custom claims and firestore documents) create a cascading delay that slows down application hydration and blocks early UI transitions. For fallback admin accounts (e.g. `admin@medstore.com`), these requests are entirely redundant because fallback admin access can be determined synchronously based on the email.
**Action:** Always check fallback criteria synchronously to short-circuit async network requests immediately. For non-fallback users, parallelize independent asynchronous authentication/privilege checks using `Promise.all` to reduce the latency from `t1 + t2` to `max(t1, t2)`.
