// Measured geometry that layout effects re-read on every commit. Each `same*` predicate
// lets its effect bail out when nothing really moved, so the effect settles instead of
// looping on sub-pixel jitter.

// Measured pixel size of a word box, keyed by slot key.
export type BoxSizeMap = Record<string, { w: number; h: number }>;

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
