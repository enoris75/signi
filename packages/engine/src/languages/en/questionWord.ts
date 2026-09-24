import type { ComplementType } from '@signi/shared';
import type { ConceptForms, ResolvedComplement, ResolvedQuestion } from '../../types.js';
import { causeSentiment } from '../../functions/causeSentiment.js';
import { type QuestionAdverb, questionAdverbial } from '../../functions/questionAdverbial.js';
import { questionGapComplement } from '../../functions/questionGapComplement.js';

// The question word of each adverbial gap (P09-E6, P09-E15). The relativizer spells the locative
// "where" too (`isPlainLocativeGap`), but a relative's word reads its head noun and a question has
// none, so the two are separate lookups on the same gap. A source is *where* too: its *from* strands
// (see `strandedGap`).
const ADVERBIAL: Record<QuestionAdverb, string> = {
  where: 'where', how: 'how', why: 'why', whereTo: 'where', whereFrom: 'where', when: 'when', untilWhen: 'until when',
};

/**
 * The English wh-word for a question's gap (P09-E6): *who* for a person and *what* for anything else
 * over the subject or the object — the answer's animacy, which the plan states because the gap has
 * no noun to read it off (`questionAnimate`) — and *where*, *how*, *why* over the three adverbial
 * gaps. The object is asked with plain *who*: *whom* is the formal register, and every other
 * question the engine writes is in the everyday one.
 *
 * A complement gap (P09-E15) is *who* / *what* too, its preposition stranded in the complement's own
 * slot (`strandedGap`): "what does the cat eat under?". A plain direction or source is *where*, a
 * time *when* or *until when* (`questionAdverbial`). The negative cause is the one English fronts
 * whole, since "who does the cat run through the fault of?" is not English: "through whose fault".
 */
export function questionWord(question: ResolvedQuestion): string {
  // The possessor's word is written by the possessor renderer, in the phrase it sits in (P09-E14).
  if (question.role === 'possessor') return 'whose';
  const adverb = questionAdverbial(question);
  if (adverb) return ADVERBIAL[adverb];
  if (question.role === 'cause' && causeSentiment(question) === 'negative') return 'through whose fault';
  return question.animate ? 'who' : 'what';
}

/**
 * The complement a stranded English question leaves in its slot (P09-E15): the gap's relation over an
 * empty stand-in, which renders as the bare preposition — "what does the cat eat **under**?", "where
 * does the cat come **from**?", "who does the man give the book **to**?" — where the relation would
 * render it, so a complement after it does not read it as its own ("what does the man cut the book
 * with in the house?"). A bare addressee strands nothing ("who does the man ask?"). `undefined` where
 * nothing strands: the clause slots, the adverbs that say it all (*where to*, *when*, *how*, *why*),
 * and the fronted negative cause. `verb` is the clause's verb: an opponent gap strands the word it
 * names for its opponent, "who does the cat play **with**?" (A350, see `questionGapComplement`).
 */
export function strandedGap(question: ResolvedQuestion | undefined, verb?: ConceptForms): Partial<Record<ComplementType, ResolvedComplement>> | undefined {
  if (!question) return undefined;
  const adverb = questionAdverbial(question);
  if (adverb && adverb !== 'whereFrom') return undefined;
  if (question.role === 'cause' && causeSentiment(question) === 'negative') return undefined;
  return questionGapComplement(question, { base: '' }, verb?.forms);
}
