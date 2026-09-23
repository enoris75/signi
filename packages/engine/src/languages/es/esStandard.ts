import type { ResolvedNounPhrase } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { coordinateElement } from './coordinateElement.js';
import { ES_EQUATIVE_INTENSIFIER_STANDARD, ES_STANDARD } from './es.consts.js';
import { npText } from './npText.js';

/**
 * The standard of comparison after a predicate adjective — "que el perro", "como el perro" — or ''
 * where the phrase has none (P09-E5). The word leads the whole group and contracts with nothing
 * ("más grande que el perro y el hombre"). A pronoun takes its **subject** form, not the tonic one
 * a preposition governs: "más grande que yo", "tan grande como tú", never "*que mí" — "que" and
 * "como" are conjunctions here, not prepositions. An equative intensifier keeps *igual de*, which
 * takes "que": "igual de grande que el perro" (A255).
 */
export function esStandard(np: ResolvedNounPhrase): string {
  const word = np.head.forms['intensifier_equative'] === '1'
    ? ES_EQUATIVE_INTENSIFIER_STANDARD
    : ES_STANDARD[adjDegree(np.head)];
  if (!np.standard || !word) return '';
  return `${word} ${coordinateElement(np.standard, (s) => (s.head.forms['person'] ? s.head.forms['base'] ?? '' : npText(s)))}`;
}
