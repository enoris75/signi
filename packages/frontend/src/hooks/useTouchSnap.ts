import { useEffect } from "react";
import { PICK_TARGET } from "../keyboard/usePickKeys.ts";

/**
 * Touch targets ≥ 44 px on the canvas (P17), without resizing a single control.
 *
 * The canvas's small controls — satellite dots, clear buttons, relation toolbars, a period's border
 * controls — are 18–22 px, and they have to stay that size: the ring layout seats them by their
 * measured pixel footprint, and the overlap resolver moves boxes around exactly those rects. Growing
 * them (or giving them a padded pseudo-element) would either move the layout or let one control's
 * invisible margin cover its neighbour, which then steals the neighbour's taps.
 *
 * So a finger tap that lands on nothing interactive — a box's paper, a ring, the bare canvas — snaps
 * to the nearest marked control whose 44 px square (centred on it) contains the tap. A tap on a
 * control's own visible body is never touched: the control underneath always wins. Mouse and pen
 * clicks are left alone, so a desktop (or a hybrid laptop's trackpad) behaves as before.
 */

/** The attribute that marks a control as a snap target: spread `touchSnapProps` onto it. */
export const TOUCH_SNAP_ATTR = "data-touch-snap";
export const touchSnapProps = { [TOUCH_SNAP_ATTR]: "" } as const;

/**
 * Marks an element that takes a tap without a click — a canvas box activates on pointer-up, through
 * the drag machinery — so a tap on it is its own and never snaps.
 */
export const TAP_OWNER_ATTR = "data-tap-owner";

/** The minimum touch target, in CSS px at a page zoom of 1. */
export const TOUCH_TARGET = 44;

// A tap on one of these already has its own target; snapping it elsewhere would take it away.
const INTERACTIVE = [
  "button",
  "a[href]",
  "input",
  "textarea",
  "select",
  "label",
  '[role="button"]',
  '[role="option"]',
  '[role="menuitem"]',
  '[role="tab"]',
  '[contenteditable="true"]',
  `[${TAP_OWNER_ATTR}]`,
  // A pick's target (see usePickKeys) takes its tap through its own onClick.
  `[${PICK_TARGET}]`,
].join(", ");

export interface SnapCandidate<T> {
  target: T;
  rect: { left: number; top: number; width: number; height: number };
}

/**
 * The candidate whose touch square — at least `size` px, centred on its rect — contains (x, y),
 * nearest by its centre. `undefined` if none does.
 */
export function pickSnapTarget<T>(
  x: number,
  y: number,
  candidates: readonly SnapCandidate<T>[],
  size = TOUCH_TARGET,
): T | undefined {
  let best: T | undefined;
  let bestDistance = Infinity;
  for (const { target, rect } of candidates) {
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = Math.abs(x - cx);
    const dy = Math.abs(y - cy);
    if (dx > Math.max(size, rect.width) / 2 || dy > Math.max(size, rect.height) / 2) continue;
    const distance = Math.hypot(dx, dy);
    if (distance < bestDistance) {
      best = target;
      bestDistance = distance;
    }
  }
  return best;
}

/**
 * Listen on `doc` for finger taps that miss every control and hand each one to the control it was
 * meant for. Returns the cleanup.
 */
export function installTouchSnap(doc: Document): () => void {
  // A `click` does not reliably say which pointer made it (Safari's is a MouseEvent), so the
  // pointerdown that started it does.
  let touch = false;
  const onPointerDown = (e: PointerEvent) => {
    touch = e.pointerType === "touch";
  };
  const onClick = (e: MouseEvent) => {
    // Once per press: a click some code fires later, with no pointer behind it, is not a tap.
    const tapped = touch;
    touch = false;
    if (!tapped) return;
    const hit = e.target instanceof Element ? e.target : null;
    if (!hit || hit.closest(INTERACTIVE)) return;
    // The square is 44 px on the glass: pinched in, the page's px are bigger, so it needs fewer.
    const scale = doc.defaultView?.visualViewport?.scale ?? 1;
    const candidates: SnapCandidate<HTMLElement>[] = [];
    for (const el of doc.querySelectorAll<HTMLElement>(`[${TOUCH_SNAP_ATTR}]`)) {
      if ((el as HTMLButtonElement).disabled) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      candidates.push({ target: el, rect });
    }
    const target = pickSnapTarget(e.clientX, e.clientY, candidates, TOUCH_TARGET / scale);
    if (!target) return;
    // Only a control the finger could have reached: one drawn at that spot and not under a sheet,
    // a popper or a stowed view.
    const { left, top, width, height } = target.getBoundingClientRect();
    const front = doc.elementFromPoint(left + width / 2, top + height / 2);
    if (!front || !target.contains(front)) return;
    e.preventDefault();
    e.stopPropagation();
    target.click();
  };
  doc.addEventListener("pointerdown", onPointerDown, true);
  doc.addEventListener("click", onClick, true);
  return () => {
    doc.removeEventListener("pointerdown", onPointerDown, true);
    doc.removeEventListener("click", onClick, true);
  };
}

/** Install the snap on the page for as long as the caller is mounted. */
export function useTouchSnap(): void {
  useEffect(() => installTouchSnap(document), []);
}
