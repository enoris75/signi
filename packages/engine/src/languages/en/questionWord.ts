import type { ResolvedQuestion } from '../../types.js';

// The question word of each adverbial gap (P09-E6). The relativizer spells the locative "where" too
// (`isPlainLocativeGap`), but a relative's word reads its head noun and a question has none, so the two
// are separate lookups on the same gap.
const ADVERBIAL: Record<'locative' | 'manner' | 'cause', string> = { locative: 'where', manner: 'how', cause: 'why' };

/**
 * The English wh-word for a question's gap (P09-E6): *who* for a person and *what* for anything else
 * over the subject or the object — the answer's animacy, which the plan states because the gap has
 * no noun to read it off (`questionAnimate`) — and *where*, *how*, *why* over the three adverbial
 * gaps. The object is asked with plain *who*: *whom* is the formal register, and every other
 * question the engine writes is in the everyday one.
 */
export function questionWord(question: ResolvedQuestion): string {
  if (question.role === 'subject' || question.role === 'directObject') return question.animate ? 'who' : 'what';
  // The possessor's word is written by the possessor renderer, in the phrase it sits in (P09-E14).
  if (question.role === 'possessor') return 'whose';
  return ADVERBIAL[question.role];
}
