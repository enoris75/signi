import type { ResolvedNounPhrase } from '../../types.js';
import { CA_EXAMPLES, CA_INCLUSION } from './ca.consts.js';
import { coordinateElement } from './coordinateElement.js';
import { isPlural } from './isPlural.js';
import { npText } from './npText.js';

/**
 * The members of the head's set a noun phrase names after it (P09-E33), with a leading space or comma,
 * or ''. *Com* runs on ("animals com el gat"); *inclòs* is parenthetical, set off on both sides, and
 * agrees with the **example**: "els animals, inclòs el gat,", "inclosa la gata", "inclosos els gossos".
 * A pronoun takes its subject form, as after the comparative's *com*.
 */
export function caExamples(np: ResolvedNounPhrase): string {
  const ex = np.examples;
  if (!ex) return '';
  const group = coordinateElement(ex.phrase, (s) => (s.head.forms['person'] ? s.head.forms['base'] ?? '' : npText(s)));
  if (ex.relation === 'example') return ` ${CA_EXAMPLES.example} ${group}`;
  const agreement = ex.phrase.agreement;
  const index = (isPlural(agreement) ? 2 : 0) + (agreement['gender'] === 'fem' ? 1 : 0);
  return `, ${CA_INCLUSION[index]} ${group},`;
}
