import type { ConceptForms, ResolvedNounElement } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { tonicPronoun } from '../../functions/tonicPronoun.js';
import { coordinate } from './coordinate.js';
import { EN_DOMAIN, EN_STANDARD } from './en.consts.js';
import { npText } from './npText.js';

/**
 * The standard of comparison after a compared adjective `adj` — "than the dog", "as the dog" — or ''
 * where it has none (P09-E5). The word is the degree's (`EN_STANDARD`), said once before the whole
 * group: "than the dog and the man". A pronoun takes its object form, "than him", the ordinary
 * spoken English one; the formal "than he (is)" is a clause, which a noun-phrase standard is not.
 *
 * On a superlative it is the set the adjective selects from (`forms['domain']`, P09-E19): "of" before
 * a plural, a coordinated or a pronoun set, "in" before a singular noun (`EN_DOMAIN`) — "the biggest
 * of the animals", "of us", "the most beautiful in the family".
 *
 * `adj` is the predicate adjective (the phrase's head, with `NounPhrase.headStandard`) or an
 * attributive one (with `NounPhrase.adjectiveStandards`, P09-E18); the words are the same.
 */
export function enStandard(adj: ConceptForms, standard: ResolvedNounElement | undefined): string {
  if (!standard) return '';
  const group = coordinate(standard, (s) => tonicPronoun(s) ?? npText(s));
  if (adj.forms['domain'] === '1') {
    const plural = standard.conjuncts.length > 1
      || (standard.agreement['number'] ?? standard.agreement['count']) === 'plural'
      || !!standard.conjuncts[0]?.head.forms['person'];
    return `${plural ? EN_DOMAIN.plural : EN_DOMAIN.singular} ${group}`;
  }
  const word = EN_STANDARD[adjDegree(adj)];
  return word ? `${word} ${group}` : '';
}
