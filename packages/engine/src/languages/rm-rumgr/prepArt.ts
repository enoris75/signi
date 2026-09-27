import { defArticle } from './defArticle.js';

/**
 * Preposition + definite article (P04 §2.1, the style sheet): only *a* and *da* contract, and only
 * with the masculine *il* / *ils* — *al, als, dal, dals*. Before a vowel, with the feminine and after
 * any other preposition the two stay apart: "a l'um", "da la chasa", "en il chaun", "sin ils mailers".
 */
export function prepArt(prep: string, forms: Record<string, string>, plural = false, lead?: string): string {
  const art = defArticle(forms, plural, lead);
  if ((prep === 'a' || prep === 'da') && (art === 'il' || art === 'ils')) return `${prep}${art.slice(1)}`;
  return `${prep} ${art}`;
}
