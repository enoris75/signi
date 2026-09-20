import type { ResolvedNounElement } from '../../types.js';
import { coordinate } from './coordinate.js';
import { npText } from './npText.js';

/**
 * The by-phrase of a passive clause — the demoted agent under "par" ("est mangée **par le chat**").
 * "par" contracts with nothing, so it is emitted once before the whole group ("par le chat et le
 * chien"); a pronoun takes its tonic form after it ("par moi"), never the article path.
 *
 * Empty when there is no agent to speak — an active clause, or the agentless passive, whose generic
 * agent the translator drops rather than passing here (see ResolvedPhrase.agent).
 */
export function agentPhrase(agent?: ResolvedNounElement): string {
  if (!agent) return '';
  const group = coordinate(agent, (np) =>
    np.head.forms['person'] ? (np.head.forms['disjunctive'] ?? np.head.forms['base'] ?? '') : npText(np));
  return group ? `par ${group}` : '';
}
