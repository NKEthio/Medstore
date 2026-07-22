# Palette's Journal

## 2025-07-22 - [Filter Tab Accessibility & Dynamic Feedback Announcements]
**Learning:** In highly dynamic e-commerce catalog pages, screen readers and key-assistive technologies are often unaware when content shifts due to navigation tab filters or async success actions like "Add to cart". Standard button visual active states don't convey selection context to screen readers, and brief transient elements disappear before they can be announced unless proper aria-live attributes or specific roles are set.
**Action:** Always include container and element accessibility properties (`role="tablist"`, `role="tab"`, `aria-selected="..."`) for visual tabs, and `role="status"` + `aria-live="polite"` for dynamic success/error alert updates in the DOM.
