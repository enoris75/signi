import { stressedA } from './stressedA.js';

export function defArticle(forms: Record<string, string>, plural = false): string {
  const gender = forms['gender'] ?? 'masc';
  if (plural) return gender === 'fem' ? 'las' : 'los';
  if (stressedA(forms, plural)) return 'el';
  return gender === 'fem' ? 'la' : 'el';
}
