import type { FocusParticle } from '@signi/shared';

/** Where a language writes its focus particle: the word, and whether it follows the phrase. */
export type FocusWords = Record<FocusParticle, { word: string; post?: boolean }>;

/**
 * Put a slot's focus particle where this language writes it (see NounPhrase.focus, C39): in front
 * of the phrase for most of them ("only the cat", "sogar die Katze"), behind it where the word goes
 * there ("the cat too", "le chat aussi"). Nothing to focus, or nothing rendered, leaves the text
 * as it was.
 */
export function withFocus(text: string, focus: FocusParticle | undefined, words: FocusWords): string {
  if (!focus || !text) return text;
  const { word, post } = words[focus];
  return post ? `${text} ${word}` : `${word} ${text}`;
}
