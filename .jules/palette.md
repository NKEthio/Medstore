## 2025-03-05 - Container-Clipped Focus Indicators and Inward Outline Offsets
**Learning:** Using `overflow: hidden` on container elements (such as button-group wrappers or quantity control blocks) clips or completely hides the standard focus-visible outer outline, creating an accessibility barrier for keyboard navigation.
**Action:** Style interactive elements nested inside `overflow: hidden` containers with a negative `outline-offset` (e.g., `outline-offset: -2px;`) or an inset box-shadow to keep the keyboard focus indicators within element boundaries and fully visible.

## 2025-03-06 - Input Focus Background Highlights and Hover-Mirroring
**Learning:** Input fields nested inside `overflow: hidden` wrappers are prone to having their standard browser focus outlines clipped. Implementing a subtle, brand-aligned focus background highlight (such as `var(--accent-light)`) on `:focus-visible` provides high-contrast, beautiful visual feedback without causing clipping or layout shifts. Furthermore, mirroring interactive card-level hover animations (e.g. lift transitions, shadow elevations, zoomed imagery, and fade-in CTAs) on `:focus-visible` ensures keyboard-only navigation users receive an identical premium, delightful experience.
**Action:** Use brand-aligned background highlights on focused input fields in restrictive layouts, and always align hover transformations with `:focus-visible` on interactive card-level elements.

## 2025-03-07 - Empty State Call-to-Actions and Transaction Timestamps
**Learning:** Having pages with empty lists or no content (such as "No orders yet") without clear navigation pathways strands users on blank views, hurting user retention. Adding an active call-to-action (like "Continue shopping" that routes back to the catalog) provides a helpful exit path. Additionally, omitting clear purchase timestamps on past transactions creates confusion and lack of context in transaction history.
**Action:** Always provide intuitive call-to-action links in empty states, and render local date/time indicators on transaction summary cards.
