import type { Case } from './de.types.js';

export function defArticle(forms: Record<string, string>, _case: Case, plural = false): string {
  if (plural) return _case === 'dat' ? 'den' : _case === 'gen' ? 'der' : 'die';
  const gender = forms['gender'] ?? 'neut';
  if (_case === 'nom') {
    return gender === 'masc' ? 'der' : gender === 'fem' ? 'die' : 'das';
  }
  if (_case === 'acc') {
    return gender === 'masc' ? 'den' : gender === 'fem' ? 'die' : 'das';
  }
  if (_case === 'gen') {
    return gender === 'fem' ? 'der' : 'des';
  }
  // dative
  return gender === 'masc' ? 'dem' : gender === 'fem' ? 'der' : 'dem';
}
