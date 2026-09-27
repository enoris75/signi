import { VOWEL_START } from './vallader.consts.js';
import { surface } from './surface.js';

/**
 * The definite article (the style sheet): *il* / *la*, *ils* / *las*, and *l'* for both genders before
 * a vowel — or *h* and a vowel — in the singular: "l'hom", "l'aua". Chosen by the sound of the word that
 * follows it (`lead`), the first prenominal adjective when there is one ("il grond hom", "l'oter
 * giat"). The plural never elides.
 */
export function defArticle(forms: Record<string, string>, plural = false, lead?: string): string {
  const fem = (forms['gender'] ?? 'masc') === 'fem';
  if (plural) return fem ? 'las' : 'ils';
  if (VOWEL_START.test(lead ?? surface(forms, plural))) return "l'";
  return fem ? 'la' : 'il';
}
