import { sursilvArticle } from './sursilvArticle.js';
import { adBeforeVowel } from './adBeforeVowel.js';
import { prepArt } from './prepArt.js';

/**
 * A preposition, as the lexicon and the engine name it. Only *a* and *da* contract with the article
 * (`prepArt`); every other one (*en, sin, cun, sco, vers, per, senza, cunter, tier, vi da* …) stands
 * apart from it, so the type is open.
 */
export type SursilvPreposition = string;

/**
 * Preposition + determiner for an adposition-bearing complement, honoring the head's `definiteness`.
 * Only the *definite* article contracts ("al tgaun", "dils tgauns"); an indefinite article, a
 * quantifier or a bare noun stays after the plain preposition — "a in tgaun", "da negina casa", "a
 * blers tgauns", "a casa". A proper noun takes the article its lexeme says, and contracts like one.
 * *a* is *ad* before a vowel (`adBeforeVowel`): "ad in um", "ad insaquants tgauns".
 */
export function prepDet(prep: SursilvPreposition, forms: Record<string, string>, plural: boolean, lead: string): string {
  const definiteness = forms['definiteness'] ?? 'definite';
  const articledName = forms['proper'] === '1' && forms['takes_article'] !== '0';
  if (definiteness === 'definite' || articledName) {
    if (forms['proper'] === '1' && forms['takes_article'] === '0') return adBeforeVowel(prep, lead);
    return prepArt(prep, forms, plural, lead);
  }
  // The partitive "most" opens with an article of its own, the feminine "la" of "la gronda part": "a
  // la gronda part dils gats".
  const det = sursilvArticle(forms, plural, lead);
  const word = adBeforeVowel(prep, det || lead);
  return det ? `${word} ${det}` : word;
}
