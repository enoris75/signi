import { SPECIAL_START, VOWEL_START } from './it.consts.js';
import { surface } from './surface.js';

/**
 * The definite article, selected by gender/number and by the sound of the word that
 * actually follows it (`lead`) — which is the first prenominal adjective when present,
 * otherwise the noun itself ("il gatto" but "lo studente", "il bravo studente").
 */
export function defArticle(forms: Record<string, string>, plural = false, lead?: string): string {
  const gender = forms['gender'] ?? 'masc';
  const base = lead ?? surface(forms, plural);
  const vowel = VOWEL_START.test(base);
  if (gender === 'fem') {
    if (plural) return 'le';
    return vowel ? "l'" : 'la';
  }
  // masculine
  if (plural) return (vowel || SPECIAL_START.test(base)) ? 'gli' : 'i';
  if (vowel) return "l'";
  return SPECIAL_START.test(base) ? 'lo' : 'il';
}
