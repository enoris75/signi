import { VOWEL_START } from './sursilv.consts.js';

/**
 * A word ending in the complementizer *che* (*che*, *cura che*, *perquei che* …) or in *sche* (if) before the clause it
 * opens, eliding to *ch'* before a vowel as Sursilvan writes it: "ch'il gat maglia", "cura ch'el cuora",
 * "che la gatta" (style sheet, verify). A word that does not end in *che* is joined plainly.
 */
export function withChe(word: string, clause: string): string {
  if (!clause) return word;
  if (!word) return clause;
  return /(^|\s)s?che$/.test(word) && VOWEL_START.test(clause) ? `${word.slice(0, -1)}'${clause}` : `${word} ${clause}`;
}
