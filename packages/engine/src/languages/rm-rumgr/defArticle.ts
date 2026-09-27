import { VOWEL_START } from './rumgr.consts.js';
import { surface } from './surface.js';

/**
 * The definite article (P04 §2.1): *il* / *la*, *ils* / *las*, and *l'* for both genders before a
 * vowel in the singular — "l'um", "l'aua" — chosen by the sound of the word that follows it (`lead`),
 * the first prenominal adjective when there is one ("il grond um"). The plural never elides.
 */
export function defArticle(forms: Record<string, string>, plural = false, lead?: string): string {
  const fem = (forms['gender'] ?? 'masc') === 'fem';
  if (plural) return fem ? 'las' : 'ils';
  if (VOWEL_START.test(lead ?? surface(forms, plural))) return "l'";
  return fem ? 'la' : 'il';
}
