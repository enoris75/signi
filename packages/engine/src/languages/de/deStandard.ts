import type { ResolvedNounPhrase } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { coordinate } from './coordinate.js';
import { DE_DOMAIN_PRONOUN, DE_STANDARD } from './de.consts.js';
import { nounPhrase } from './nounPhrase.js';
import { tonicPronounDe } from './tonicPronounDe.js';

/**
 * The standard of comparison after a predicate adjective — "als der Hund", "wie der Hund" — or ''
 * where the phrase has none (P09-E5). "als" and "wie" are conjunctions and govern no case: the
 * standard stands in the case of what it is compared with, which for a subject's predicate adjective
 * is the nominative — "größer als der Hund", "größer als er", never the dative a preposition would
 * give. The word leads the whole group: "größer als der Hund und der Mann".
 *
 * On a superlative it is the set the adjective selects from (`forms['domain']`, P09-E19): the bare
 * **genitive** of a noun ("das größte der Tiere", "der Familie"), and "von" + the dative of a pronoun
 * ("der größte von uns"; `DE_DOMAIN_PRONOUN`), the genitive pronoun being archaic. Per conjunct, so a
 * coordinated set is "der Tiere und der Männer".
 */
export function deStandard(np: ResolvedNounPhrase): string {
  if (!np.standard) return '';
  if (np.head.forms['domain'] === '1') {
    return coordinate(np.standard, (s) =>
      s.head.forms['person'] ? `${DE_DOMAIN_PRONOUN} ${tonicPronounDe(s.head.forms, 'dat')}` : nounPhrase(s, 'gen'));
  }
  const word = DE_STANDARD[adjDegree(np.head)];
  if (!word) return '';
  return `${word} ${coordinate(np.standard, (s) => (s.head.forms['person'] ? s.head.forms['base'] ?? '' : nounPhrase(s, 'nom')))}`;
}
