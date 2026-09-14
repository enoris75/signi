import { artFor } from './artFor.js';
import { prepArt } from './prepArt.js';

/**
 * Preposition + determiner for an adposition-bearing complement, honoring the head's
 * `definiteness`. Only the *definite* article fuses with the preposition (al/alla/nel/dal/sul…);
 * an indefinite article, quantifier, or bare noun stays uncontracted after the plain prep —
 * "a una casa", "a nessuna casa", "a molte case", "a casa". `all` keeps its own definite
 * article, which likewise doesn't fuse ("a tutte le case").
 *
 * "con" (the instrumental) is the exception that fuses with nothing: modern standard Italian
 * writes "con il coltello", leaving the fused "col" to speech.
 */
export type ItPreposition = 'a' | 'da' | 'in' | 'di' | 'su' | 'con' | 'come';

export function prepDet(prep: ItPreposition, forms: Record<string, string>, plural: boolean, lead: string): string {
  // "con" (instrumental) and "come" (similative) fuse with no article — "con il", "come il". A proper
  // noun takes the definite article whatever was picked (see `artFor`), so it fuses like one:
  // "dall'Africa", "all'Europa". So does a mass noun's partitive, which is itself di + article and
  // cannot follow another preposition: "a causa dell'acqua", never "di dell'acqua".
  const definiteness = forms['definiteness'] ?? 'definite';
  const partitive = forms['uncountable'] === '1' && definiteness === 'some';
  const definite = definiteness === 'definite' || forms['proper'] === '1' || partitive;
  if (prep !== 'con' && prep !== 'come' && definite) return prepArt(prep, forms, plural, lead);
  const det = artFor(forms, plural, lead);
  return det ? `${prep} ${det}` : prep;
}
