import { VOWEL_START } from './sursilv.consts.js';
import { surface } from './surface.js';

/**
 * The definite article (style sheet): *il* / *la*, *ils* / *las*; before a vowel the masculine is
 * ***igl*** ("igl um", "igl auto") and the feminine elides to *l'* ("l'aua") — chosen by the sound of
 * the word that follows it (`lead`), the first prenominal adjective when there is one ("igl auter
 * gat"). The plural never changes.
 */
export function defArticle(forms: Record<string, string>, plural = false, lead?: string): string {
  const fem = (forms['gender'] ?? 'masc') === 'fem';
  if (plural) return fem ? 'las' : 'ils';
  if (VOWEL_START.test(lead ?? surface(forms, plural))) return fem ? "l'" : 'igl';
  return fem ? 'la' : 'il';
}
