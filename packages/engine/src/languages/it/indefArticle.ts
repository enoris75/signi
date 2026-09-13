import { SPECIAL_START, VOWEL_START } from './it.consts.js';

/**
 * The indefinite article, by gender and the sound of the following word (`lead`):
 * masc "un" ("un cane") / "uno" (s-impura, z: "uno studente") · fem "una" / "un'"
 * before a vowel ("un'amica"). Plural indefinite has no article here (bare "cani").
 */
export function indefArticle(forms: Record<string, string>, plural: boolean, lead?: string): string {
  if (plural) return '';
  const gender = forms['gender'] ?? 'masc';
  const base = lead ?? '';
  if (gender === 'fem') return VOWEL_START.test(base) ? "un'" : 'una';
  return SPECIAL_START.test(base) ? 'uno' : 'un';
}
