import { stressedA } from './stressedA.js';

/** The indefinite article: un/una (singular), unos/unas (plural). */
export function indefArticle(forms: Record<string, string>, plural = false): string {
  const gender = forms['gender'] ?? 'masc';
  if (plural) return gender === 'fem' ? 'unas' : 'unos';
  if (stressedA(forms, plural)) return 'un';
  return gender === 'fem' ? 'una' : 'un';
}
