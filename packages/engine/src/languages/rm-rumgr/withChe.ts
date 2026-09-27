import { VOWEL_START } from './rumgr.consts.js';

/**
 * A word ending in the complementizer *che* (*che*, *cura che*, *perquai che* …) or in *sche* (if) before the clause it
 * opens, eliding to *ch'* before a vowel as RG writes it: "ch'il giat mangia", "cura ch'el curra",
 * "che la giatta" (style sheet, verify). A word that does not end in *che* is joined plainly.
 */
export function withChe(word: string, clause: string): string {
  if (!clause) return word;
  if (!word) return clause;
  return /(^|\s)s?che$/.test(word) && VOWEL_START.test(clause) ? `${word.slice(0, -1)}'${clause}` : `${word} ${clause}`;
}
