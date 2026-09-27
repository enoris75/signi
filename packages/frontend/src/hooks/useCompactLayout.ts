import { useMediaQuery } from "@mui/material";

/**
 * The phone layout (P17): below MUI's `sm` breakpoint the page is one column under a bottom tab bar,
 * and the header's controls fold into a menu. The same width the console already uses to start
 * hidden on a narrow window.
 */
export const COMPACT_QUERY = "(max-width: 599.95px)";

/**
 * A device with a finger and no mouse: no hover, a coarse pointer. Keycaps and key tips mean nothing
 * there, and the soft keyboard's keydowns are typing, not a keyboard user arriving.
 */
export const TOUCH_ONLY_QUERY = "(hover: none) and (pointer: coarse)";
/** The same, as an `sx` key: `{ [TOUCH_ONLY_MEDIA]: { display: "none" } }`. */
export const TOUCH_ONLY_MEDIA = `@media ${TOUCH_ONLY_QUERY}`;

export function useCompactLayout(): boolean {
  // noSsr reads the query on the first render, so a phone never paints the desktop layout first.
  return useMediaQuery(COMPACT_QUERY, { noSsr: true });
}

export function isTouchOnly(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.(TOUCH_ONLY_QUERY).matches === true;
}
