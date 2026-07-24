# Palette's Journal - Critical UX & Accessibility Learnings

## 2025-07-24 - Firestore Network Hang Prevention in Dev / Verification Environment
**Learning:** In a minimal React + Firebase store application, calling Firestore APIs (like `getDocs`) with fallback or dummy placeholder API keys causes network hangs or very slow timeouts. This blocks visual verification tools (like Playwright) and harms the developer UX.
**Action:** Detect fallback credentials using an `isFallback` flag from `src/lib/firebase.js` and immediately bypass Firebase calls, serving local fallback data (e.g., `sample-products.json`) instantly. This ensures immediate visual feedback, flawless keyboard navigation testing, and an uninterrupted offline dev loop.
