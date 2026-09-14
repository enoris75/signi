import { defArticle } from './defArticle.js';

/**
 * Generic Italian simple-preposition + definite-article fusion for "a" (to),
 * "da" (from), "in" (in), "di" (of) and "su" (on): al/dal/nel/del/sul, allo/dallo/nello/dello/sullo,
 * alla/dalla/nella/della/sulla, all'/dall'/nell'/dell'/sull', …
 */
export function prepArt(prep: 'a' | 'da' | 'in' | 'di' | 'su', forms: Record<string, string>, plural = false, lead?: string): string {
  const art = defArticle(forms, plural, lead);
  const prefix = prep === 'di' ? 'de' : prep === 'in' ? 'ne' : prep;
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
