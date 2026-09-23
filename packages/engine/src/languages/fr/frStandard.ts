import type { ResolvedNounPhrase } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { tonicPronoun } from '../../functions/tonicPronoun.js';
import { coordinate } from './coordinate.js';
import { FR_STANDARD, VOWEL_START } from './fr.consts.js';
import { joinArt } from './joinArt.js';
import { npText } from './npText.js';

/**
 * The standard of comparison after a predicate adjective — "que le chien" — or '' where the phrase
 * has none (P09-E5). "que" leads the whole group ("plus grand que le chien et l'homme") and elides
 * before a vowel as it always does ("qu'un chien", "qu'elle"). A pronoun takes its tonic form: "plus
 * grand que moi", "que lui", never the clitic "*que je".
 */
export function frStandard(np: ResolvedNounPhrase): string {
  const word = FR_STANDARD[adjDegree(np.head)];
  if (!np.standard || !word) return '';
  const group = coordinate(np.standard, (s) => tonicPronoun(s) ?? npText(s));
  return joinArt(VOWEL_START.test(group) ? "qu'" : word, group);
}
