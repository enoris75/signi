import type { CaAdjectives } from './ca.types.js';
import { NO_ELISION } from './caSurface.js';

/**
 * A determiner (or preposition + determiner) and the rest of its noun phrase. Where the noun itself
 * follows a feminine *la* and its lexeme says `no_elision` (*la universitat, la història*, style-ca.md
 * § Nouns), the two are joined by `NO_ELISION`, which `caSurface` never elides across. Any other join
 * is a space; the elision of an article before a vowel is `caSurface`'s.
 */
export function joinHead(head: string, rest: string, forms: Record<string, string>, adj?: CaAdjectives, numeral = ''): string {
  if (!head) return rest;
  if (!rest) return head;
  const nounFirst = !adj?.pre && !numeral;
  const sep = nounFirst && forms['no_elision'] === '1' && /(^|\s)la$/.test(head) ? NO_ELISION : ' ';
  return `${head}${sep}${rest}`;
}
