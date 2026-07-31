## 2025-03-05 - Container-Clipped Focus Indicators and Inward Outline Offsets
**Learning:** Using `overflow: hidden` on container elements (such as button-group wrappers or quantity control blocks) clips or completely hides the standard focus-visible outer outline, creating an accessibility barrier for keyboard navigation.
**Action:** Style interactive elements nested inside `overflow: hidden` containers with a negative `outline-offset` (e.g., `outline-offset: -2px;`) or an inset box-shadow to keep the keyboard focus indicators within element boundaries and fully visible.

## 2025-03-06 - Input Focus Background Highlights and Hover-Mirroring
**Learning:** Input fields nested inside `overflow: hidden` wrappers are prone to having their standard browser focus outlines clipped. Implementing a subtle, brand-aligned focus background highlight (such as `var(--accent-light)`) on `:focus-visible` provides high-contrast, beautiful visual feedback without causing clipping or layout shifts. Furthermore, mirroring interactive card-level hover animations (e.g. lift transitions, shadow elevations, zoomed imagery, and fade-in CTAs) on `:focus-visible` ensures keyboard-only navigation users receive an identical premium, delightful experience.
**Action:** Use brand-aligned background highlights on focused input fields in restrictive layouts, and always align hover transformations with `:focus-visible` on interactive card-level elements.

## 2025-03-07 - Contextual Post-Action Shortcuts
**Learning:** Displaying a simple status notification (e.g., "Added to cart successfully.") provides confirmation but still forces the user to scan the layout or navigate elsewhere to continue their main flow. Integrating a highly visible, contextual shortcut link (like "View Cart →") directly within the success message reduces cognitive load and manual navigation friction, creating a much smoother post-action experience.
**Action:** Always include primary next-step navigation shortcuts alongside non-disruptive success or feedback notifications to facilitate seamless user flows.
