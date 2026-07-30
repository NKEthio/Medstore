# Bolt's Performance Journal

## 2025-03-04 - Authentication & Admin State Recovery Network Bottleneck
**Learning:** Sequential asynchronous network requests during `onAuthStateChanged` (fetching custom claims and firestore documents) create a cascading delay that slows down application hydration and blocks early UI transitions. For fallback admin accounts (e.g. `admin@medstore.com`), these requests are entirely redundant because fallback admin access can be determined synchronously based on the email.
**Action:** Always check fallback criteria synchronously to short-circuit async network requests immediately. For non-fallback users, parallelize independent asynchronous authentication/privilege checks using `Promise.all` to reduce the latency from `t1 + t2` to `max(t1, t2)`.

## 2026-07-30 - Home Page Hydration Delay & LCP Image Loading Bottlenecks
**Learning:** Hydration flashes and initial page load lag occur when navigating back to the homepage due to redundant async network requests (Firestore reads). Also, lazy-loaded above-the-fold catalog images delay Largest Contentful Paint (LCP) scores.
**Action:** Implement an in-memory product cache for Stale-While-Revalidate (SWR) catalog loading to enable instant back-navigation rendering. Mark above-the-fold list images (index < 4) with `loading="eager"` and React 19 `fetchPriority="high"` to optimize LCP.
