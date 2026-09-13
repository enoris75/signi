import { artFor } from './artFor.js';

/**
 * Non-contracting preposition (para …) + determiner, honoring the head's `definiteness`.
 * Carries whatever `artFor` yields: "para uma casa", "para a casa", bare "para" (→ "para casa").
 */
export function prepDet(prep: string, forms: Record<string, string>, plural = false): string {
  const det = artFor(forms, plural);
  return det ? `${prep} ${det}` : prep;
}
