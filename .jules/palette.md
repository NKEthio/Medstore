## 2025-03-05 - Container-Clipped Focus Indicators and Inward Outline Offsets
**Learning:** Using `overflow: hidden` on container elements (such as button-group wrappers or quantity control blocks) clips or completely hides the standard focus-visible outer outline, creating an accessibility barrier for keyboard navigation.
**Action:** Style interactive elements nested inside `overflow: hidden` containers with a negative `outline-offset` (e.g., `outline-offset: -2px;`) or an inset box-shadow to keep the keyboard focus indicators within element boundaries and fully visible.
