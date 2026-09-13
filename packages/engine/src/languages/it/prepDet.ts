import { artFor } from './artFor.js';
import { prepArt } from './prepArt.js';

/**
 * Preposition + determiner for an adposition-bearing complement, honoring the head's
 * `definiteness`. Only the *definite* article fuses with the preposition (al/alla/nel/dal…);
 * an indefinite article, quantifier, or bare noun stays uncontracted after the plain prep —
 * "a una casa", "a nessuna casa", "a molte case", "a casa". `all` keeps its own definite
 * article, which likewise doesn't fuse ("a tutte le case").
 *
 * "con" (the instrumental) is the exception that fuses with nothing: modern standard Italian
 * writes "con il coltello", leaving the fused "col" to speech.
 */
export function prepDet(prep: 'a' | 'da' | 'in' | 'di' | 'con' | 'come', forms: Record<string, string>, plural: boolean, lead: string): string {
  // "con" (instrumental) and "come" (similative) fuse with no article — "con il", "come il".
  if (prep !== 'con' && prep !== 'come' && (forms['definiteness'] ?? 'definite') === 'definite') return prepArt(prep, forms, plural, lead);
  const det = artFor(forms, plural, lead);
  return det ? `${prep} ${det}` : prep;
}
