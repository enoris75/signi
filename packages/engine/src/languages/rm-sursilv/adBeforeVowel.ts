import { VOWEL_START } from './sursilv.consts.js';

/**
 * The preposition `prep` as it stands before `next`: *a* is *ad* before a vowel — "vegn ad esser",
 * "ad in um", "ad el" (style sheet) — and before the silent *h* of *haver* ("vegn ad haver magliau",
 * verify); *a* before anything else. Every other preposition comes back unchanged.
 */
export function adBeforeVowel(prep: string, next: string): string {
  return prep === 'a' && (VOWEL_START.test(next) || /^hav/i.test(next)) ? 'ad' : prep;
}
