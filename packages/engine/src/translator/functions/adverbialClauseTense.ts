import type { SubordinatingConjunction, VerbPhrase } from '@signi/shared';
import { FUTURE_AS_PERFECT, FUTURE_AS_PRESENT_LANGUAGES, TEMPORAL_CONJUNCTIONS } from '../translator.consts.js';

/**
 * The verb phrase an adverbial clause is resolved with (A251). English and German say a **future**
 * event under a temporal conjunction in the present — "the man will run when the cat eats", "der Mann
 * wird laufen, wenn der Kater frisst" — and German *nachdem* in the perfect, the same rule one tense
 * back: "nachdem der Kater gefressen hat". A marked aspect keeps its own auxiliary and only the tense
 * moves ("while the cat is eating"). Unchanged under *because*, outside the future, and in the other
 * languages (see `FUTURE_AS_PRESENT_LANGUAGES`).
 */
export function adverbialClauseTense(
  conjunction: SubordinatingConjunction,
  language: string,
  verbPhrase: VerbPhrase,
): VerbPhrase {
  if (verbPhrase.tense !== 'future' || !TEMPORAL_CONJUNCTIONS.has(conjunction) || !FUTURE_AS_PRESENT_LANGUAGES.has(language)) {
    return verbPhrase;
  }
  const perfect = FUTURE_AS_PERFECT[language]?.has(conjunction) && (verbPhrase.aspect ?? 'neutral') === 'neutral';
  return { ...verbPhrase, tense: 'present', ...(perfect ? { aspect: 'resultative' as const } : {}) };
}
