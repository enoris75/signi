/**
 * The preposition `prep` as it stands before `next`: "a" takes the euphonic d before a word starting
 * with the same vowel — "ad abbastanza cani", "ad alcuni cani", "ad amici", "obbligato ad agire" —
 * and stays "a" before any other ("a ogni cane", "a un amico", "a essere"), as modern usage writes it
 * (A312). Every other preposition comes back unchanged.
 */
export function euphonicA(prep: string, next: string): string {
  return prep === 'a' && /^a/i.test(next) ? 'ad' : prep;
}
