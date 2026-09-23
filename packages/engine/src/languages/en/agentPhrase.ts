import type { ResolvedNounElement } from '../../types.js';
import { AGENT_PREP } from './en.consts.js';
import { coordinate } from './coordinate.js';
import { npText } from './npText.js';
import { objectPronounText } from './objectPronounText.js';

/**
 * The by-phrase of a passive clause — the demoted agent under "by" ("is eaten **by the cat**",
 * "was seen **by me**"). A pronoun takes its object form, as it does after any preposition; a noun
 * renders as an ordinary noun phrase with its own determiner. The preposition is emitted once,
 * before the whole group ("by the cat and the dog"). An agent that is the clause's subject itself
 * — a 1st- or 2nd-person pronoun with `subjectForms`' person and number — is reflexive, as the
 * active object is: "I am seen **by myself**" (A177). The relativizer's "by whom" is no personal
 * pronoun, so `relativeText` passes no subject.
 *
 * Empty when the clause has no agent to speak: an active clause, or a passive whose agent is the
 * generic person, which the translator drops rather than passing here (see ResolvedPhrase.agent).
 */
export function agentPhrase(agent?: ResolvedNounElement, subjectForms: Record<string, string> = {}): string {
  if (!agent) return '';
  const group = coordinate(agent, (np) =>
    np.head.forms['person'] ? objectPronounText(np.head.forms, subjectForms) : npText(np));
  // A question's stand-in for the agent asked about is wordless, and leaves "by" stranded after the
  // participle: "who is the food eaten **by**?" (P09-E16).
  if (!group) return agent.conjuncts[0]?.head.forms['question'] === '1' ? AGENT_PREP : '';
  return `${AGENT_PREP} ${group}`;
}
