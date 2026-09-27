import { adBeforeVowel } from './adBeforeVowel.js';
import { defArticle } from './defArticle.js';

/**
 * Preposition + definite article (style sheet, every contraction *(verify)*): *a*, *da* and *en*
 * contract with the masculine *il* / *ils* — *al, als*; ***dil, dils***; *el, els*. With the feminine,
 * with *igl* and after any other preposition the two stay apart: "a la casa", "ad igl um", "da igl um", "sin il
 * terren". The contractions the style sheet does not list (*alla, dalla, ella*; *agl, digl, egl*;
 * *sil*) are RG's behaviour kept and pinned `test.fails` in the suite (P04-E8 D2).
 */
export function prepArt(prep: string, forms: Record<string, string>, plural = false, lead?: string): string {
  const art = defArticle(forms, plural, lead);
  if (art === 'il' || art === 'ils') {
    if (prep === 'a') return `a${art.slice(1)}`;
    if (prep === 'da') return `d${art}`;
    if (prep === 'en') return `e${art.slice(1)}`;
  }
  return `${adBeforeVowel(prep, art)} ${art}`;
}
