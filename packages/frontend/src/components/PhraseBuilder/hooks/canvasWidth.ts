/**
 * The canvas's real width on a phone (P17 phase 3): the ring layout keeps laying phrases out as if
 * it had a desktop's width, so nothing shrinks and nothing re-stacks — the same math, the same
 * shapes, whatever the screen. What changes is how much of it is shown at once: the wrapper that
 * holds it (PhraseCanvas.tsx) scrolls natively, with the browser's own pinch-zoom.
 */
export const MIN_CANVAS_WIDTH = 600;
