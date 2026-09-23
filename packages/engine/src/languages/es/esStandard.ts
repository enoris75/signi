import type { ResolvedNounPhrase } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { coordinateElement } from './coordinateElement.js';
import { ES_DOMAIN, ES_EQUATIVE_INTENSIFIER_STANDARD, ES_STANDARD } from './es.consts.js';
import { npText } from './npText.js';
import { prepObjectText } from './prepObjectText.js';

/**
 * The standard of comparison after a predicate adjective — "que el perro", "como el perro" — or ''
 * where the phrase has none (P09-E5). The word leads the whole group and contracts with nothing
 * ("más grande que el perro y el hombre"). A pronoun takes its **subject** form, not the tonic one
 * a preposition governs: "más grande que yo", "tan grande como tú", never "*que mí" — "que" and
 * "como" are conjunctions here, not prepositions. An equative intensifier keeps *igual de*, which
 * takes "que": "igual de grande que el perro" (A255).
 *
 * On a superlative it is the set the adjective selects from (`forms['domain']`, P09-E19): the
 * preposition "de" (`ES_DOMAIN`), which contracts with each conjunct's "el" and so repeats per
 * conjunct ("el más grande de los animales y de los hombres"), and which, being a preposition,
 * governs a pronoun's **tonic** form: "de nosotros", "de él".
 */
export function esStandard(np: ResolvedNounPhrase): string {
  if (np.standard && np.head.forms['domain'] === '1') {
    return coordinateElement(np.standard, (s) => prepObjectText(s, ES_DOMAIN));
  }
  const word = np.head.forms['intensifier_equative'] === '1'
    ? ES_EQUATIVE_INTENSIFIER_STANDARD
    : ES_STANDARD[adjDegree(np.head)];
  if (!np.standard || !word) return '';
  return `${word} ${coordinateElement(np.standard, (s) => (s.head.forms['person'] ? s.head.forms['base'] ?? '' : npText(s)))}`;
}
