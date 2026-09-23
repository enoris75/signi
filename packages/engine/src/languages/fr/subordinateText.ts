import { VOWEL_START } from './fr.consts.js';

/**
 * A subordinate clause behind the word that introduces it — "que le chat court", "quand le chat
 * mange", "parce que le chat mange" (P09-E4). A word ending on "que" elides it before a vowel, as
 * "que" always does: "qu'il court", "parce qu'on mange", "avant qu'un chat mange". "Quand" does not
 * elide; its liaison is spoken, not written.
 */
export function subordinateText(word: string, clause: string): string {
  return /que$/.test(word) && VOWEL_START.test(clause)
    ? `${word.slice(0, -1)}'${clause}`
    : `${word} ${clause}`;
}
