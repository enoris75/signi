import { useEffect, useState } from "react";

/**
 * Below this, a gap between the visual viewport's foot and the layout viewport's is a browser's
 * collapsing toolbar or a rounding, not a soft keyboard (the smallest is well over 150 px).
 */
const MIN_KEYBOARD = 80;

/**
 * How much of the layout viewport the soft keyboard covers, in CSS pixels; 0 while it is closed
 * (P17-E1). iOS Safari, and Chrome on Android by default (`resizes-visual`), lay the keyboard over the
 * page rather than shrinking it: the layout viewport keeps its height, and only the visual viewport
 * — what is on the glass — ends above the keyboard. Its foot is `offsetTop + height`, so what lies
 * under the keyboard is the rest of `innerHeight`. Read again on the visual viewport's `resize` (the
 * keyboard opening or closing) and `scroll` (the browser panning the page to the focused field).
 *
 * A pinch-zoomed page has a short visual viewport too, with no keyboard: only an unzoomed one counts.
 */
export function keyboardInset(win: Pick<Window, "innerHeight" | "visualViewport">): number {
  const vv = win.visualViewport;
  if (!vv || vv.scale > 1.01) return 0;
  const inset = Math.round(win.innerHeight - (vv.offsetTop + vv.height));
  return inset >= MIN_KEYBOARD ? inset : 0;
}

export function useKeyboardInset(enabled = true): number {
  const [inset, setInset] = useState(0);
  useEffect(() => {
    if (!enabled) {
      setInset(0);
      return;
    }
    const vv = window.visualViewport;
    if (!vv) return;
    // A plain number, set only when it changes: a resize storm while the keyboard slides in must not
    // re-render the console tab at every frame.
    const measure = () => setInset(keyboardInset(window));
    measure();
    vv.addEventListener("resize", measure);
    vv.addEventListener("scroll", measure);
    return () => {
      vv.removeEventListener("resize", measure);
      vv.removeEventListener("scroll", measure);
    };
  }, [enabled]);
  return inset;
}
