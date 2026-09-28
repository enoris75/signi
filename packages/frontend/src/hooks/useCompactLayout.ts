import { useMediaQuery } from "@mui/material";

/**
 * A device with a finger and no mouse: no hover, a coarse pointer. Keycaps and key tips mean nothing
 * there, and the soft keyboard's keydowns are typing, not a keyboard user arriving.
 */
export const TOUCH_ONLY_QUERY = "(hover: none) and (pointer: coarse)";

/**
 * The phone layout (P17): below MUI's `sm` breakpoint the page is one column under a bottom tab bar,
 * and the header's controls fold into a menu. The same width the console already uses to start
 * hidden on a narrow window. A phone held sideways is wider than that (an iPhone is 874×402) but
 * no taller than a phone, and the desktop's header alone would take half its height, so a touch
 * screen under 500 px tall is a phone too. The smallest tablet is 744 px tall in landscape.
 */
export const COMPACT_QUERY = `(max-width: 599.95px), ${TOUCH_ONLY_QUERY} and (max-height: 499.95px)`;
/** The same, as an `sx` key: `{ [TOUCH_ONLY_MEDIA]: { display: "none" } }`. */
export const TOUCH_ONLY_MEDIA = `@media ${TOUCH_ONLY_QUERY}`;

export function useCompactLayout(): boolean {
  // noSsr reads the query on the first render, so a phone never paints the desktop layout first.
  return useMediaQuery(COMPACT_QUERY, { noSsr: true });
}

/**
 * A tablet (P17-E4): touch-only and below MUI's `md` (900 px), but wider than a phone. The canvas
 * takes the whole width there, the translations under it, and the console stays docked — no tab bar.
 * A desktop window as narrow, driven by a mouse, keeps its two columns.
 */
export const STACKED_QUERY = `${TOUCH_ONLY_QUERY} and (max-width: 899.95px)`;

export function useStackedLayout(): boolean {
  const stacked = useMediaQuery(STACKED_QUERY, { noSsr: true });
  const compact = useCompactLayout();
  return stacked && !compact;
}

export function isTouchOnly(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.(TOUCH_ONLY_QUERY).matches === true;
}
