import type { ResolvedNounElement } from '../../types.js';
import { coordinate } from './coordinate.js';
import { objectNpText } from './objectNpText.js';
import { withRelative } from './withRelative.js';

/**
 * The by-phrase of a passive clause — the demoted agent under "par" ("est mangée **par le chat**").
 * "par" contracts with nothing, so it is emitted once before the whole group ("par le chat et le
 * chien"); a pronoun takes its tonic form after it ("par moi"), never the article path.
 *
 * French has no zero article after "par" either: a bare plural or mass agent takes the direct
 * object's partitive (`objectNpText`), "par des chats", "par de l'eau" (A379). The negative "de" is
 * the object's alone, so the agent is never negated.
 *
 * Empty when there is no agent to speak — an active clause, or the agentless passive, whose generic
 * agent the translator drops rather than passing here (see ResolvedPhrase.agent).
 */
export function agentPhrase(agent?: ResolvedNounElement): string {
  if (!agent) return '';
  const group = coordinate(agent, (np) =>
    np.head.forms['person'] ? withRelative(np.head.forms['disjunctive'] ?? np.head.forms['base'] ?? '', np) : objectNpText(np, false));
  return group ? `par ${group}` : '';
}
