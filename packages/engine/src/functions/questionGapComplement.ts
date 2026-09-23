import type { ComplementType } from '@signi/shared';
import type { ResolvedComplement, ResolvedNounElement, ResolvedQuestion } from '../types.js';

/**
 * The stand-in for a wh-question's word where it fills a noun slot (P09-E15): the word the engine
 * passes in `forms` (Italian "che cosa" / "chi", French "quoi" / "qui", English "" to strand the
 * preposition…) on the answer's animacy, the third singular, with no article and no concept — so an
 * engine renders it wherever that slot's noun would stand, with the slot's own adposition, case and
 * contraction: "sotto che cosa", "grazie a chi", "mit wem", 何の下で. `forms` may override the
 * `definiteness` (German's declined *wer*, see its `determiner`). It is marked `question`, for the
 * article a relation would otherwise force on a bare noun (French *avec* + article).
 */
export function questionStandIn(question: ResolvedQuestion, forms: Record<string, string>): ResolvedNounElement {
  const head = {
    conceptId: '',
    forms: {
      definiteness: 'bare', gender: 'masc', number: 'singular', question: '1',
      ...(question.animate ? { animate: '1', human: '1' } : {}),
      ...forms,
    },
  };
  return { conjuncts: [{ head, adjectives: [], nounModifiers: [] }], agreement: head.forms };
}

/**
 * A wh-question's complement gap as a one-complement map for the engine's own `complementsPhrase`,
 * the way `relativeGapComplement` builds a relative's (P09-E15): the stand-in (`questionStandIn`)
 * in the gapped relation, its `specifiers` kept. `undefined` for a gap that is no complement — the
 * subject, the object, the possessor, and a passive's agent, which is the by-phrase's (P09-E16).
 */
export function questionGapComplement(
  question: ResolvedQuestion | undefined,
  forms: Record<string, string>,
): Partial<Record<ComplementType, ResolvedComplement>> | undefined {
  if (!question || question.role === 'subject' || question.role === 'directObject' || question.role === 'possessor'
    || question.role === 'agent') return undefined;
  const complement: ResolvedComplement = {
    phrase: questionStandIn(question, forms),
    ...(question.specifiers ? { specifiers: question.specifiers } : {}),
  };
  return { [question.role]: complement };
}
