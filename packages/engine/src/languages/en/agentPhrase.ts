import type { ResolvedNounElement } from '../../types.js';
import { objectPronounForm } from '../../functions/objectPronounForm.js';
import { AGENT_PREP } from './en.consts.js';
import { coordinate } from './coordinate.js';
import { npText } from './npText.js';

/**
 * The by-phrase of a passive clause — the demoted agent under "by" ("is eaten **by the cat**",
 * "was seen **by me**"). A pronoun takes its object form, as it does after any preposition; a noun
 * renders as an ordinary noun phrase with its own determiner. The preposition is emitted once,
 * before the whole group ("by the cat and the dog").
 *
 * Empty when the clause has no agent to speak: an active clause, or a passive whose agent is the
 * generic person, which the translator drops rather than passing here (see ResolvedPhrase.agent).
 */
export function agentPhrase(agent?: ResolvedNounElement): string {
  if (!agent) return '';
  const group = coordinate(agent, (np) =>
    np.head.forms['person'] ? objectPronounForm(np.head.forms) : npText(np));
  return group ? `${AGENT_PREP} ${group}` : '';
}
