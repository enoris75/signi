import { VOWEL_START } from './vallader.consts.js';

/**
 * A word ending in the complementizer *cha* (*cha*, *cur cha*, *avant cha* …) or in *scha* (if)
 * before the clause it opens (the author's draft, verify):
 *
 * - before a vowel both elide: "ch'el cuorra", "sch'el cuorra";
 * - both fuse with a following masculine article *il / ils*: "cha'l giat mangia", "scha'ls chans
 *   cuorran";
 * - anything else is joined plainly: "cha la giatta".
 *
 * A word that does not end in *cha* is joined plainly (the subject relative *chi* never elides).
 */
export function withCha(word: string, clause: string): string {
  if (!clause) return word;
  if (!word) return clause;
  if (!/(^|\s)s?cha$/.test(word)) return `${word} ${clause}`;
  const fused = /^il(s?) /.exec(clause);
  if (fused) return `${word}'l${fused[1]} ${clause.slice(fused[0].length)}`;
  if (VOWEL_START.test(clause)) return `${word.slice(0, -1)}'${clause}`;
  return `${word} ${clause}`;
}
