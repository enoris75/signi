import type { Tense, VerbPhrase } from '@signi/shared';
import type { Mood } from '../../types.js';
import {
  FUTURE_IN_PAST_PERFECT_LANGUAGES,
  IMPERFECT_PAST_LANGUAGES,
  PAST_SUBJUNCTIVE_LANGUAGES,
  SEQUENCE_OF_TENSES_LANGUAGES,
} from '../translator.consts.js';

/** What a content clause is resolved with: its verb phrase, its mood, and whether its past is the imperfect. */
export interface ContentClauseTense {
  verbPhrase: VerbPhrase | undefined;
  mood: Mood | undefined;
  /** The clause's past is a state's, the imperfect (see `asImperfect`). */
  imperfect: boolean;
}

/**
 * The tense a content clause is resolved in, given its governor's (A254). A clause **simultaneous**
 * with a past governor shifts back — the sequence of tenses of `SEQUENCE_OF_TENSES_LANGUAGES`:
 *
 * - the present subjunctive becomes the imperfect subjunctive, "non credeva che il gatto
 *   **corresse**", "no creía que el gato **corriera**" — except in French, whose imperfect subjunctive
 *   is literary and whose speech keeps the present ("ne croyait pas que le chat **coure**",
 *   `PAST_SUBJUNCTIVE_LANGUAGES`);
 * - the indicative present becomes the past, which in the Romance languages is the imperfect of a
 *   state ("disse che il gatto **correva**", "dijo que el gato **corría**") and in English the simple
 *   past ("said that the cat **ran**");
 * - the future becomes the conditional ("would run", "courrait", "correría"), and in Italian the
 *   *condizionale composto*, with the verb's own auxiliary ("disse che il gatto **avrebbe corso**",
 *   `FUTURE_IN_PAST_PERFECT_LANGUAGES`).
 *
 * A clause already in the past, or in the resultative, is anterior to its governor, not simultaneous
 * with it, and is left alone: its shift would be the pluperfect. German's *dass* clause keeps its own
 * tense and Japanese's is relative already, so neither is among the languages. Unchanged under a
 * governor that is not past.
 */
export function contentClauseTense(
  governorTense: Tense | undefined,
  language: string,
  mood: Mood | undefined,
  verbPhrase: VerbPhrase | undefined,
): ContentClauseTense {
  const unchanged: ContentClauseTense = { verbPhrase, mood, imperfect: false };
  if (!verbPhrase || governorTense !== 'past' || !SEQUENCE_OF_TENSES_LANGUAGES.has(language)) return unchanged;
  const tense = verbPhrase.tense ?? 'present';
  if (tense === 'past' || (verbPhrase.aspect ?? 'neutral') === 'resultative') return unchanged;
  if (mood === 'presentSubjunctive') {
    return PAST_SUBJUNCTIVE_LANGUAGES.has(language) ? { ...unchanged, mood: 'subjunctive' } : unchanged;
  }
  if (mood !== undefined) return unchanged;
  if (tense === 'future') {
    const perfect = FUTURE_IN_PAST_PERFECT_LANGUAGES.has(language) && (verbPhrase.aspect ?? 'neutral') === 'neutral';
    return {
      verbPhrase: { ...verbPhrase, tense: 'present', ...(perfect ? { aspect: 'resultative' as const } : {}) },
      mood: 'conditional',
      imperfect: false,
    };
  }
  return { verbPhrase: { ...verbPhrase, tense: 'past' }, mood, imperfect: IMPERFECT_PAST_LANGUAGES.has(language) };
}
