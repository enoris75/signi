import type { Case } from './gsw.types.js';

/**
 * The Swiss German indefinite article (P10-E5 D3): *en / e / es*, dative *emene / enere / emene*.
 * Nominative and accusative are one form, and a genitive slot takes the dative (P10 D7). No plural,
 * as in German.
 */
export function indefArticle(_case: Case, gender: string, plural: boolean): string {
  if (plural) return '';
  if (_case === 'dat' || _case === 'gen') return gender === 'fem' ? 'enere' : 'emene';
  return gender === 'masc' ? 'en' : gender === 'fem' ? 'e' : 'es';
}
