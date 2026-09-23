import type { ConceptForms, ResolvedNounElement } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { coordinateElement } from './coordinateElement.js';
import { ES_DOMAIN, ES_EQUATIVE_INTENSIFIER_STANDARD, ES_STANDARD } from './es.consts.js';
import { npText } from './npText.js';
import { prepObjectText } from './prepObjectText.js';

/**
 * The standard of comparison after a compared adjective `adj` — "que el perro", "como el perro" — or
 * '' where it has none (P09-E5). The word leads the whole group and contracts with nothing ("más
 * grande que el perro y el hombre"). A pronoun takes its **subject** form, not the tonic one a
 * preposition governs: "más grande que yo", "tan grande como tú", never "*que mí" — "que" and
 * "como" are conjunctions here, not prepositions. An equative intensifier keeps *igual de*, which
 * takes "que": "igual de grande que el perro" (A255).
 *
 * On a superlative it is the set the adjective selects from (`forms['domain']`, P09-E19): the
 * preposition "de" (`ES_DOMAIN`), which contracts with each conjunct's "el" and so repeats per
 * conjunct ("el más grande de los animales y de los hombres"), and which, being a preposition,
 * governs a pronoun's **tonic** form: "de nosotros", "de él".
 *
 * `adj` is the predicate adjective or an attributive one (P09-E18): "un gato más grande que el perro".
 */
export function esStandard(adj: ConceptForms, standard: ResolvedNounElement | undefined): string {
  if (!standard) return '';
  if (adj.forms['domain'] === '1') return coordinateElement(standard, (s) => prepObjectText(s, ES_DOMAIN));
  const word = adj.forms['intensifier_equative'] === '1'
    ? ES_EQUATIVE_INTENSIFIER_STANDARD
    : ES_STANDARD[adjDegree(adj)];
  if (!word) return '';
  return `${word} ${coordinateElement(standard, (s) => (s.head.forms['person'] ? s.head.forms['base'] ?? '' : npText(s)))}`;
}
