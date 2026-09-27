import { artFor } from './artFor.js';

/**
 * A preposition + the head's own determiner, honoring its `definiteness`: "en una casa", "amb el
 * bastó", bare "amb cura". The contraction of *a / de / per* with *el / els* is `caSurface`'s.
 */
export function prepDet(prep: string, forms: Record<string, string>, plural = false): string {
  const det = artFor(forms, plural);
  return det ? `${prep} ${det}` : prep;
}
