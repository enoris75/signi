import { defArticle } from './defArticle.js';

/**
 * Preposition + definite article (the style sheet): *a* + *il* → *al*, *da* + *il* → *dal*, and their
 * plurals *als, dals* (verify); *in* + *il* → *i'l*, *in* + *la* → *illa*, *in* + *ils* → *i'ls*, and
 * *in* + *las* → *illas* by the same pattern (verify). Before a vowel and after any other preposition
 * the two stay apart: "a l'hom", "da la chasa", "in l'aua", "sün il terrain" (the style sheet does not
 * list *sül*; pinned `test.fails` in the suite).
 */
export function prepArt(prep: string, forms: Record<string, string>, plural = false, lead?: string): string {
  const art = defArticle(forms, plural, lead);
  if ((prep === 'a' || prep === 'da') && (art === 'il' || art === 'ils')) return `${prep}${art.slice(1)}`;
  if (prep === 'in') {
    if (art === 'il' || art === 'ils') return `i'${art.slice(1)}`;
    if (art === 'la' || art === 'las') return `il${art}`;
  }
  return `${prep} ${art}`;
}
