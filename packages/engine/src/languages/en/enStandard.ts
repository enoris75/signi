import type { ResolvedNounPhrase } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { tonicPronoun } from '../../functions/tonicPronoun.js';
import { coordinate } from './coordinate.js';
import { EN_DOMAIN, EN_STANDARD } from './en.consts.js';
import { npText } from './npText.js';

/**
 * The standard of comparison after a predicate adjective — "than the dog", "as the dog" — or '' where
 * the phrase has none (P09-E5). The word is the degree's (`EN_STANDARD`), said once before the whole
 * group: "than the dog and the man". A pronoun takes its object form, "than him", the ordinary
 * spoken English one; the formal "than he (is)" is a clause, which a noun-phrase standard is not.
 *
 * On a superlative it is the set the adjective selects from (`forms['domain']`, P09-E19): "of" before
 * a plural, a coordinated or a pronoun set, "in" before a singular noun (`EN_DOMAIN`) — "the biggest
 * of the animals", "of us", "the most beautiful in the family".
 */
export function enStandard(np: ResolvedNounPhrase): string {
  if (!np.standard) return '';
  const group = coordinate(np.standard, (s) => tonicPronoun(s) ?? npText(s));
  if (np.head.forms['domain'] === '1') {
    const set = np.standard;
    const plural = set.conjuncts.length > 1 || (set.agreement['number'] ?? set.agreement['count']) === 'plural' || !!set.conjuncts[0]?.head.forms['person'];
    return `${plural ? EN_DOMAIN.plural : EN_DOMAIN.singular} ${group}`;
  }
  const word = EN_STANDARD[adjDegree(np.head)];
  return word ? `${word} ${group}` : '';
}
