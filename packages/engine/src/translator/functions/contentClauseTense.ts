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
 * with it, and takes the pluperfect where it can (A263, see `anteriorToPast`). German's *dass* clause
 * keeps its own tense and Japanese's is relative already, so neither is among the languages.
 *
 * Under a governor that is not past, a **past** clause in the present subjunctive — which every Romance
 * engine builds from the stored present, whatever the tense — takes the perfect subjunctive instead
 * (A260): the aspect auxiliary in the present subjunctive and the participle, "non crede che il gatto
 * **abbia corso**", "ne croit pas que le chat **ait couru**", "no cree que el gato **haya corrido**",
 * "não acredita que o gato **tenha corrido**". A future one keeps the present subjunctive, which reads
 * as future in all four ("no cree que el gato corra"), and an indicative clause its own past. A past
 * **progressive** is imperfective, not a completed event, so its auxiliary takes the imperfect
 * subjunctive instead (A262), the tense it has under a past governor: "non crede che il gatto **stesse**
 * correndo", "no cree que el gato **estuviera** corriendo", "não acredita que o gato **estivesse**
 * correndo". French, whose imperfect subjunctive is literary, is left as it was.
 */
export function contentClauseTense(
  governorTense: Tense | undefined,
  language: string,
  mood: Mood | undefined,
  verbPhrase: VerbPhrase | undefined,
): ContentClauseTense {
  const unchanged: ContentClauseTense = { verbPhrase, mood, imperfect: false };
  if (!verbPhrase) return unchanged;
  const tense = verbPhrase.tense ?? 'present';
  const neutral = (verbPhrase.aspect ?? 'neutral') === 'neutral';
  if (governorTense !== 'past') {
    if (mood !== 'presentSubjunctive' || tense !== 'past') return unchanged;
    // A past clause in the present subjunctive is the perfect subjunctive (A260).
    if (neutral) return { ...unchanged, verbPhrase: { ...verbPhrase, tense: 'present', aspect: 'resultative' } };
    // A past progressive is imperfective: its auxiliary takes the imperfect subjunctive (A262).
    if (verbPhrase.aspect === 'progressive' && PAST_SUBJUNCTIVE_LANGUAGES.has(language)) {
      return { ...unchanged, verbPhrase: { ...verbPhrase, tense: 'present' }, mood: 'subjunctive' };
    }
    return unchanged;
  }
  if (!SEQUENCE_OF_TENSES_LANGUAGES.has(language)) return unchanged;
  const resultative = verbPhrase.aspect === 'resultative';
  if (resultative || tense === 'past') return anteriorToPast(language, mood, verbPhrase, tense, neutral, unchanged);
  if (mood === 'presentSubjunctive') {
    return PAST_SUBJUNCTIVE_LANGUAGES.has(language) ? { ...unchanged, mood: 'subjunctive' } : unchanged;
  }
  if (mood !== undefined) return unchanged;
  if (tense === 'future') {
    const perfect = FUTURE_IN_PAST_PERFECT_LANGUAGES.has(language) && neutral;
    return {
      verbPhrase: { ...verbPhrase, tense: 'present', ...(perfect ? { aspect: 'resultative' as const } : {}) },
      mood: 'conditional',
      imperfect: false,
    };
  }
  return { verbPhrase: { ...verbPhrase, tense: 'past' }, mood, imperfect: IMPERFECT_PAST_LANGUAGES.has(language) };
}

/**
 * A clause **anterior** to a past governor — a past-neutral or a present-resultative one — is the
 * pluperfect (A263): the aspect auxiliary in the past plus the participle. In the indicative that is
 * the resultative in the past, "said that the cat **had run**", "disse che il gatto **aveva corso**",
 * "dijo que el gato **había corrido**"; in the subjunctive it is the resultative in the imperfect
 * subjunctive, "non credeva che il gatto **avesse corso**", "no creía que el gato **hubiera corrido**".
 * French keeps its spoken perfect subjunctive ("ne croyait pas que le chat **ait couru**"), as it keeps
 * its present one for a simultaneous clause. A plain past **indicative** clause is left alone ("said
 * that the cat ran", "disse che il gatto corse" are grammatical). A past progressive in the subjunctive
 * takes the imperfect subjunctive of its auxiliary, as under a present governor (A262: "non credeva che
 * il gatto **stesse** correndo"), except in French; any other aspect or tense is left alone.
 */
function anteriorToPast(
  language: string,
  mood: Mood | undefined,
  verbPhrase: VerbPhrase,
  tense: Tense,
  neutral: boolean,
  unchanged: ContentClauseTense,
): ContentClauseTense {
  const pastNeutral = tense === 'past' && neutral;
  const presentResultative = tense === 'present' && verbPhrase.aspect === 'resultative';
  if (mood === 'presentSubjunctive' && (pastNeutral || presentResultative)) {
    const perfect: VerbPhrase = { ...verbPhrase, tense: 'present', aspect: 'resultative' };
    return { ...unchanged, verbPhrase: perfect, mood: PAST_SUBJUNCTIVE_LANGUAGES.has(language) ? 'subjunctive' : mood };
  }
  // A past progressive is imperfective, simultaneous with a past of its own: the imperfect
  // subjunctive of its auxiliary, as under a present governor (A262). French is left as it is.
  if (mood === 'presentSubjunctive' && tense === 'past' && verbPhrase.aspect === 'progressive'
    && PAST_SUBJUNCTIVE_LANGUAGES.has(language)) {
    return { ...unchanged, verbPhrase: { ...verbPhrase, tense: 'present' }, mood: 'subjunctive' };
  }
  if (mood === undefined && presentResultative) {
    return { ...unchanged, verbPhrase: { ...verbPhrase, tense: 'past' } };
  }
  return unchanged;
}
