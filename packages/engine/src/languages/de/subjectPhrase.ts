import type { ResolvedNounPhrase } from '../../types.js';
import { nounPhrase } from './nounPhrase.js';
import { subordinateClause } from './subordinateClause.js';

export function subjectPhrase(np: ResolvedNounPhrase): string {
  const forms = np.head.forms;
  // A pronoun is its own nominative; an indefinite one keeps its relative clause: "jemand, der
  // läuft, sieht den Kater" (A309).
  if (forms['person']) {
    return `${forms['number'] === 'plural' && forms['plural'] ? forms['plural'] : forms['base'] ?? ''}${subordinateClause(np)}`;
  }
  return nounPhrase(np, 'nom'); // noun — nominative article
}
