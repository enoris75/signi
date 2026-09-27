import { VOWEL_START } from './rumgr.consts.js';

/**
 * The preposition `prep` as it stands before `next`: *a* is *ad* before any vowel — "vegn ad esser",
 * "ad in um", "ad el" — and *a* before anything else, the elided article included ("a l'um"). Every
 * other preposition comes back unchanged (P04 D7, verify).
 */
export function adBeforeVowel(prep: string, next: string): string {
  return prep === 'a' && VOWEL_START.test(next) ? 'ad' : prep;
}
