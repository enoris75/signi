import { DEFAULT_LOCATIVE_SPECIFIER } from '@signi/shared';
import type { ResolvedQuestion } from '../types.js';
import { causeSentiment } from './causeSentiment.js';
import { pathSpecifier } from './pathSpecifier.js';
import { temporalRelation } from './temporalRelation.js';

/** The question adverbs, each engine spelling them in its own `ADVERBIAL` table. */
export type QuestionAdverb = 'where' | 'how' | 'why' | 'whereTo' | 'whereFrom' | 'when' | 'untilWhen';

/**
 * The adverb a wh-question's gap is asked with, or `undefined` when it is asked through its
 * complement path with *what* / *who* (P09-E15, `questionGapComplement`) or is no complement at all.
 * A plain relation needs no preposition, so it is an adverb (D2):
 *  - the locative in its default relation (`in`) — *where* (P09-E6); a marked one ("under what?")
 *    keeps its preposition;
 *  - the manner — *how*; a neutral cause — *why* (P09-E6);
 *  - a direction or a source with no relation of its own, asked of a **place** — *where (to)*,
 *    *where from* (dove / da dove, wohin / woher, adónde / de dónde, どこへ / どこから). Asked of a person
 *    it is the complement path: "who does the cat go to?", *zu wem*, *da chi*;
 *  - the temporal `at` — *when* — and `until` — *until when* (the translator refuses the others).
 */
export function questionAdverbial(question: ResolvedQuestion | undefined): QuestionAdverb | undefined {
  if (!question) return undefined;
  const gap = { specifiers: question.specifiers };
  switch (question.role) {
    case 'locative': return pathSpecifier(gap, DEFAULT_LOCATIVE_SPECIFIER) === 'in' ? 'where' : undefined;
    case 'manner': return 'how';
    case 'cause': return causeSentiment(gap) === 'neutral' ? 'why' : undefined;
    case 'direction': return plainPlace(question) ? 'whereTo' : undefined;
    case 'source': return plainPlace(question) ? 'whereFrom' : undefined;
    case 'temporal': return temporalRelation(gap) === 'until' ? 'untilWhen' : 'when';
    default: return undefined;
  }
}

// A motion gap asked of a place, in no relation but its own: the one the adverb stands for.
function plainPlace(question: ResolvedQuestion): boolean {
  return !question.animate && !question.specifiers?.some((s) => s.kind === 'path');
}
