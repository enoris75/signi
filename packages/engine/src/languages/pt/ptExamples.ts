import type { ResolvedNounPhrase } from '../../types.js';
import { coordinateElement } from './coordinateElement.js';
import { npText } from './npText.js';

/**
 * The members of the head's set a noun phrase names after it (P09-E33), with a leading space or
 * comma, or ''. *Como* runs on ("animais como o gato"); *incluindo*, a gerund, is invariable and
 * parenthetical, set off on both sides ("os animais, incluindo o gato,"). A pronoun takes its subject
 * form, as after the comparative's *como*: "como eu", "incluindo ele".
 */
export function ptExamples(np: ResolvedNounPhrase): string {
  const ex = np.examples;
  if (!ex) return '';
  const group = coordinateElement(ex.phrase, (s) => (s.head.forms['person'] ? s.head.forms['base'] ?? '' : npText(s)));
  return ex.relation === 'inclusion' ? `, incluindo ${group},` : ` como ${group}`;
}
