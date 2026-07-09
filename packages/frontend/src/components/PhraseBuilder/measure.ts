// Measured geometry that layout effects re-read on every commit. Each `same*` predicate
// lets its effect bail out when nothing really moved, so the effect settles instead of
// looping on sub-pixel jitter.

// Measured pixel size of a word box, keyed by slot key.
export type BoxSizeMap = Record<string, { w: number; h: number }>;

// A connector from a noun box down to its (open, uncollapsed) possessor panel.
// Coordinates are pixels relative to the builder's root Box.
export type RelConnector = {
  which: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
};

// Equal within half a pixel on every key.
export function sameBoxSizes(a: BoxSizeMap, b: BoxSizeMap): boolean {
  const keysA = Object.keys(a);
  if (keysA.length !== Object.keys(b).length) return false;
  for (const k of keysA) {
    const pb = b[k];
    if (!pb) return false;
    if (Math.abs(a[k].w - pb.w) > 0.5 || Math.abs(a[k].h - pb.h) > 0.5) return false;
  }
  return true;
}

// Equal within half a pixel on every endpoint.
export function sameRelConnectors(a: RelConnector[], b: RelConnector[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const p = a[i];
    const q = b[i];
    if (p.which !== q.which || p.color !== q.color) return false;
    if (
      Math.abs(p.x1 - q.x1) > 0.5 ||
      Math.abs(p.y1 - q.y1) > 0.5 ||
      Math.abs(p.x2 - q.x2) > 0.5 ||
      Math.abs(p.y2 - q.y2) > 0.5
    )
      return false;
  }
  return true;
}
