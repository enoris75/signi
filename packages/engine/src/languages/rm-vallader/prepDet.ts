import { vlArticle } from './vlArticle.js';
import { adBeforeVowel } from './adBeforeVowel.js';
import { prepArt } from './prepArt.js';

/**
 * A preposition, as the lexicon and the engine name it. Only *a*, *da* and *in* contract with the
 * article (`prepArt`); every other one (*sün, cun, sco, vers, per, sainza, cunter, pro* …) stands apart
 * from it, so the type is open.
 */
export type VlPreposition = string;

/**
 * Preposition + determiner for an adposition-bearing complement, honoring the head's `definiteness`.
 * Only the *definite* article contracts ("al chan", "dals chans", "illa chasa"); an indefinite article,
 * a quantifier or a bare noun stays after the plain preposition — "a ün chan", "da ingüna chasa", "a
 * blers chans", "a chasa". A proper noun takes the article its lexeme says, and contracts like one.
 * *a* is *ad* before a vowel (`adBeforeVowel`): "ad ün hom".
 */
export function prepDet(prep: VlPreposition, forms: Record<string, string>, plural: boolean, lead: string): string {
  const definiteness = forms['definiteness'] ?? 'definite';
  const articledName = forms['proper'] === '1' && forms['takes_article'] !== '0';
  if (definiteness === 'definite' || articledName) {
    if (forms['proper'] === '1' && forms['takes_article'] === '0') return adBeforeVowel(prep, lead);
    return prepArt(prep, forms, plural, lead);
  }
  // The partitive "most" opens with an article of its own, the feminine "la" of "la gronda part": "a
  // la gronda part dals giats".
  const det = vlArticle(forms, plural, lead);
  const word = adBeforeVowel(prep, det || lead);
  return det ? `${word} ${det}` : word;
}
