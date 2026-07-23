# BOLT'S JOURNAL - PERFORMANCE OPTIMIZATIONS

## 2025-02-18 - [Parallel Admin Privilege Verification & Synchronous Short-Circuiting]
**Learning:** Checking admin privileges sequentially via multiple asynchronous steps (custom claims via `getIdTokenResult` and Firestore doc fetch via `getDoc`) introduces unnecessary latency, doubling network response times. Furthermore, query times can be completely bypassed for default/bootstrap administrators by checking their emails synchronously first.
**Action:** Use synchronous fallback checks to short-circuit any asynchronous network requests first. If a network verification is still required, parallelize the retrieval of custom claims and Firestore documents using `Promise.all` with robust individual `.catch` handlers to safeguard against partial service failures.
