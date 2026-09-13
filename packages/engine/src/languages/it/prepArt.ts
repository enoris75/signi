import { defArticle } from './defArticle.js';

/**
 * Generic Italian simple-preposition + definite-article fusion for "a" (to),
 * "da" (from), "in" (in) and "di" (of): al/dal/nel/del, allo/dallo/nello/dello,
 * alla/dalla/nella/della, all'/dall'/nell'/dell', …
 */
export function prepArt(prep: 'a' | 'da' | 'in' | 'di', forms: Record<string, string>, plural = false, lead?: string): string {
  const art = defArticle(forms, plural, lead);
  const prefix = prep === 'a' ? 'a' : prep === 'da' ? 'da' : prep === 'di' ? 'de' : 'ne';
  let suffix: string;
  switch (art) {
    case 'il':  suffix = 'l'; break;
    case 'lo':  suffix = 'llo'; break;
    case 'la':  suffix = 'lla'; break;
    case "l'":  suffix = "ll'"; break;
    case 'i':   suffix = 'i'; break;
    case 'gli': suffix = 'gli'; break;
    case 'le':  suffix = 'lle'; break;
    default:    return `${prep} ${art}`;
  }
  return prefix + suffix;
}
