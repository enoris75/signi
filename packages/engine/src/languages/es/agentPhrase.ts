import type { ResolvedNounElement } from '../../types.js';
import { coordinateElement } from './coordinateElement.js';
import { npText } from './npText.js';

/**
 * The by-phrase of a passive clause — the demoted agent under "por" ("es comida **por el gato**").
 * Spanish contracts "por" with nothing, so it is emitted once before the whole group ("por el gato
 * y el perro"); a pronoun takes its tonic form after it ("por mí").
 *
 * Empty when there is no agent to speak — an active clause, or the agentless passive, whose generic
 * agent the translator drops rather than passing here (see ResolvedPhrase.agent).
 */
export function agentPhrase(agent?: ResolvedNounElement): string {
  if (!agent) return '';
  const group = coordinateElement(agent, (np) =>
    np.head.forms['person'] ? (np.head.forms['disjunctive'] ?? np.head.forms['base'] ?? '') : npText(np));
  return group ? `por ${group}` : '';
}
