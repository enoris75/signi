import type { ResolvedNounPhrase } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { tonicPronoun } from '../../functions/tonicPronoun.js';
import { coordinate } from './coordinate.js';
import { EN_STANDARD } from './en.consts.js';
import { npText } from './npText.js';

/**
 * The standard of comparison after a predicate adjective — "than the dog", "as the dog" — or '' where
 * the phrase has none (P09-E5). The word is the degree's (`EN_STANDARD`), said once before the whole
 * group: "than the dog and the man". A pronoun takes its object form, "than him", the ordinary
 * spoken English one; the formal "than he (is)" is a clause, which a noun-phrase standard is not.
 */
export function enStandard(np: ResolvedNounPhrase): string {
  const word = EN_STANDARD[adjDegree(np.head)];
  if (!np.standard || !word) return '';
  return `${word} ${coordinate(np.standard, (s) => tonicPronoun(s) ?? npText(s))}`;
}
