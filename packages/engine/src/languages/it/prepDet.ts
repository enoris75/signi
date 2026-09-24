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
 * writes "con il coltello", leaving the fused "col" to speech. "come" and "verso" never fuse, nor do
 * P09-E2's "per" (the purpose — "per l'uomo", the literary "pel" long gone) and "senza" (the
 * privative, "senza il coltello"), nor P09-E22's "contro" (the opponent, "contro il cane").
 */
export type ItPreposition = 'a' | 'da' | 'in' | 'di' | 'su' | 'con' | 'come' | 'verso' | 'per' | 'senza' | 'contro';

const NON_FUSING = ['con', 'come', 'verso', 'per', 'senza', 'contro'] as const;
const fuses = (prep: ItPreposition): prep is Exclude<ItPreposition, typeof NON_FUSING[number]> =>
  !(NON_FUSING as readonly string[]).includes(prep);

export function prepDet(prep: ItPreposition, forms: Record<string, string>, plural: boolean, lead: string): string {
  // "con" (instrumental), "come" (similative) and "verso" (towards) fuse with no article — "con il",
  // "come il", "verso il". A proper noun takes the definite article whatever was picked (see
  // `artFor`), so it fuses like one: "dall'Africa", "all'Europa". So does a mass noun's partitive,
  // which is itself di + article and cannot follow another preposition: "a causa dell'acqua", never
  // "di dell'acqua".
  const definiteness = forms['definiteness'] ?? 'definite';
  const partitive = forms['uncountable'] === '1' && definiteness === 'some';
  // A name the language leaves bare says so, and takes none here either (`takes_article: '0'`, C38).
  const articledName = forms['proper'] === '1' && forms['takes_article'] !== '0';
  const definite = definiteness === 'definite' || articledName || partitive;
  if (fuses(prep) && definite) return prepArt(prep, forms, plural, lead);
  // The partitive "most" opens with an article of its own, the feminine "la" of "la maggior parte",
  // and a fusing preposition takes it: "alla maggior parte dei gatti", "nella maggior parte delle case"
  // (P09-E25).
  if (fuses(prep) && definiteness === 'most') {
    return `${prepArt(prep, { gender: 'fem' }, false, 'maggior')} ${artFor(forms, plural, lead).replace(/^la /, '')}`;
  }
  const det = artFor(forms, plural, lead);
  return det ? `${prep} ${det}` : prep;
}
