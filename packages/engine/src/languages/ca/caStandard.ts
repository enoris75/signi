import type { ConceptForms, ResolvedNounElement } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { coordinateElement } from './coordinateElement.js';
import { CA_DOMAIN, CA_EQUATIVE_INTENSIFIER_STANDARD, CA_STANDARD } from './ca.consts.js';
import { npText } from './npText.js';
import { prepObjectText } from './prepObjectText.js';

/**
 * The standard of comparison after a compared adjective — "que el gos", "com el gos" — or '' where it
 * has none (P09-E5). A pronoun takes its **subject** form: "més gran que jo", "tan gran com tu" —
 * *que* and *com* are conjunctions here. An equative intensifier keeps *igual de*, which takes *que*
 * (A255).
 *
 * On a superlative it is the set the adjective selects from (`forms['domain']`, P09-E19): the
 * preposition *de*, contracting with each conjunct's article ("el més gran dels animals") and
 * governing a pronoun's tonic form ("de nosaltres").
 */
export function caStandard(adj: ConceptForms, standard: ResolvedNounElement | undefined): string {
  if (!standard) return '';
  if (adj.forms['domain'] === '1') return coordinateElement(standard, (s) => prepObjectText(s, CA_DOMAIN));
  const word = adj.forms['intensifier_equative'] === '1'
    ? CA_EQUATIVE_INTENSIFIER_STANDARD
    : CA_STANDARD[adjDegree(adj)];
  if (!word) return '';
  return `${word} ${coordinateElement(standard, (s) => (s.head.forms['person'] ? s.head.forms['base'] ?? '' : npText(s)))}`;
}
