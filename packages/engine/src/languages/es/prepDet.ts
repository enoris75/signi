import { artFor } from './artFor.js';

/**
 * Non-contracting preposition (en / hacia / por …) + determiner, honoring the head's
 * `definiteness`. Spanish only fuses "a"/"de" with "el", so these carry whatever `artFor`
 * yields: "en una casa", "en la casa", bare "en" (→ "en casa").
 */
export function prepDet(prep: string, forms: Record<string, string>, plural = false): string {
  const det = artFor(forms, plural);
  return det ? `${prep} ${det}` : prep;
}
