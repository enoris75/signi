import type { ResolvedNounPhrase } from '../../types.js';
import { coordinateElement } from './coordinateElement.js';
import { isPlural } from './isPlural.js';
import { npText } from './npText.js';

/**
 * The members of the head's set a noun phrase names after it (P09-E33), with a leading space or
 * comma, or ''. *Como* runs on ("animales como el gato"); *incluido* is parenthetical, set off on
 * both sides, and agrees with the **example**, not the head: "los animales, incluido el gato,",
 * "incluida la gata", "incluidos los perros", "incluidas las gatas". A pronoun takes its subject
 * form, as after the comparative's *como*: "como yo", "incluido yo".
 */
export function esExamples(np: ResolvedNounPhrase): string {
  const ex = np.examples;
  if (!ex) return '';
  const group = coordinateElement(ex.phrase, (s) => (s.head.forms['person'] ? s.head.forms['base'] ?? '' : npText(s)));
  if (ex.relation === 'example') return ` como ${group}`;
  const agreement = ex.phrase.agreement;
  const ending = `${agreement['gender'] === 'fem' ? 'a' : 'o'}${isPlural(agreement) ? 's' : ''}`;
  return `, incluid${ending} ${group},`;
}
