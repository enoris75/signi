/**
 * The page's landmarks, and the walk between them (the plan's §2).
 *
 * <kbd>⇥</kbd> walks the words of a phrase and <kbd>F6</kbd> walks the *places* — the header, the
 * periods, the translations, the words panel. It is the way out of the canvas and back, and the
 * one movement that does not care what the cursor is on.
 *
 * Each region remembers where it was last left, so coming back to it is coming back to the same
 * place rather than to the top of it.
 */

/** The regions, in the order F6 walks them. A region absent from the page is skipped. */
export const REGIONS = ["header", "periods", "translations", "words", "console"] as const;

export type Region = (typeof REGIONS)[number];

/** Where each region was last left, so F6 comes back to it rather than to its first control. */
const lastFocus = new WeakMap<HTMLElement, HTMLElement>();

/**
 * The landmarks on the page, in the order above. A region that is shut away is not a place to go:
 * the words panel slides off-screen and goes `inert`, which is exactly that fact, stated.
 */
export function regionElements(): HTMLElement[] {
  if (typeof document === "undefined") return [];
  return REGIONS.flatMap((region) => {
    const el = document.querySelector<HTMLElement>(`[data-kb-region="${region}"]`);
    return el && !el.hasAttribute("inert") && !el.hasAttribute("hidden") ? [el] : [];
  });
}

/** The region `el` is in, if any. */
export function regionOf(el: Element | null | undefined): HTMLElement | null {
  return el?.closest?.("[data-kb-region]") ?? null;
}

/**
 * Everything inside a region the keyboard can reach. A region's own cursor rules take over from
 * there; this is only how F6 finds somewhere to land.
 */
function focusable(region: HTMLElement): HTMLElement[] {
  return Array.from(
    region.querySelectorAll<HTMLElement>(
      '[data-kb-box], [data-kb-period], button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => !el.closest("[inert]") && el.getAttribute("aria-hidden") !== "true");
}

/**
 * Move to the region after (or before) the one the cursor is in, landing where that region was
 * last left. Answers whether there was anywhere to go.
 */
export function stepRegion(from: Element | null, delta: 1 | -1): boolean {
  const all = regionElements();
  if (all.length === 0) return false;
  const here = regionOf(from);
  // Remember where this region is being left, so F6 back to it comes back here. Recorded on the
  // way out rather than on every focus: leaving is exactly when it matters.
  if (here && from instanceof HTMLElement) lastFocus.set(here, from);
  // From nowhere in particular, F6 starts at the first region rather than the second.
  let at = here ? all.indexOf(here) : delta === 1 ? -1 : 0;
  // A region with nothing in it to land on — the translations before a first sentence — is not a
  // place either, so the walk carries on past it rather than stopping dead.
  for (let tried = 0; tried < all.length; tried++) {
    at = (at + delta + all.length) % all.length;
    const region = all[at]!;
    const last = lastFocus.get(region);
    const target = last?.isConnected && region.contains(last) ? last : focusable(region)[0];
    if (target) {
      target.focus();
      return true;
    }
  }
  return false;
}
