import type { ResolvedNounPhrase } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { coordinate } from './coordinate.js';
import { DE_STANDARD } from './de.consts.js';
import { nounPhrase } from './nounPhrase.js';

/**
 * The standard of comparison after a predicate adjective — "als der Hund", "wie der Hund" — or ''
 * where the phrase has none (P09-E5). "als" and "wie" are conjunctions and govern no case: the
 * standard stands in the case of what it is compared with, which for a subject's predicate adjective
 * is the nominative — "größer als der Hund", "größer als er", never the dative a preposition would
 * give. The word leads the whole group: "größer als der Hund und der Mann".
 */
export function deStandard(np: ResolvedNounPhrase): string {
  const word = DE_STANDARD[adjDegree(np.head)];
  if (!np.standard || !word) return '';
  return `${word} ${coordinate(np.standard, (s) => (s.head.forms['person'] ? s.head.forms['base'] ?? '' : nounPhrase(s, 'nom')))}`;
}
