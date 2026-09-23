import type { SubordinatingConjunction, Tense } from '@signi/shared';
import type { Mood } from '../../types.js';
import { CONTENT_CLAUSE_MOOD, PAST_SUBJUNCTIVE_LANGUAGES, SUBJUNCTIVE_CONJUNCTIONS } from '../translator.consts.js';

/**
 * The mood an adverbial clause is resolved in (P09-E4, D4): the indicative, except under a
 * conjunction that governs the subjunctive — the Romance *before*, "prima che il gatto **mangi**",
 * "avant que le chat **mange**". Nothing else governs the clause, so the conjunction alone decides.
 *
 * A past event under it takes the imperfect subjunctive where the language has a living one ("prima
 * che il gatto **mangiasse**", "antes de que el gato **comiera**", `PAST_SUBJUNCTIVE_LANGUAGES`); the
 * present subjunctive stands for every other tense. Where the language has no subjunctive (en, de,
 * ja) the clause stays indicative.
 */
export function adverbialClauseMood(
  conjunction: SubordinatingConjunction,
  language: string,
  tense: Tense | undefined,
): Mood | undefined {
  if (!SUBJUNCTIVE_CONJUNCTIONS.has(conjunction)) return undefined;
  if (tense === 'past' && PAST_SUBJUNCTIVE_LANGUAGES.has(language)) return 'subjunctive';
  return CONTENT_CLAUSE_MOOD[language];
}
