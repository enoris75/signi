import type { ResolvedNounPhrase } from '../../types.js';
import { DE_EXAMPLES } from './de.consts.js';
import { coordinate } from './coordinate.js';
import type { Case } from './de.types.js';
import { nounPhrase } from './nounPhrase.js';
import { tonicPronounDe } from './tonicPronounDe.js';

/**
 * The members of the head's set a noun phrase names after it (P09-E33), with a leading space or
 * comma, or ''. *Wie* is a conjunction and governs no case: the example stands in `_case`, the
 * phrase's own, as the comparative's standard does — "Tiere wie der Kater laufen", "sieht Tiere wie
 * den Kater". *Einschließlich* is a preposition taking the genitive, and parenthetical, set off on
 * both sides: "die Tiere, einschließlich des Katers, laufen". A pronoun, whose genitive is archaic,
 * takes the dative the preposition falls back to ("einschließlich ihm").
 *
 * It follows everything in the phrase, a relative clause included, whose closing comma it meets
 * (`punctuate` collapses the two).
 */
export function nounExamples(np: ResolvedNounPhrase, _case: Case): string {
  const ex = np.examples;
  if (!ex) return '';
  if (ex.relation === 'example') {
    return ` ${DE_EXAMPLES.example} ${coordinate(ex.phrase, (s) => (s.head.forms['person'] ? tonicPronounDe(s.head.forms, _case) : nounPhrase(s, _case)))}`;
  }
  return `, ${DE_EXAMPLES.inclusion} ${coordinate(ex.phrase, (s) => (s.head.forms['person'] ? tonicPronounDe(s.head.forms, 'dat') : nounPhrase(s, 'gen')))},`;
}
