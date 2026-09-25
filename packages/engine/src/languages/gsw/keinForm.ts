import type { Case } from './gsw.types.js';

/**
 * *kei*, Swiss German *kein* (P10-E6 D1): *kei* in the masculine, feminine and plural, *keis* in the
 * neuter; dative *keim / keinere / keim*, plural *kei*. One form for nominative and accusative, the
 * dative for a genitive slot (P10 D7).
 */
export function keinForm(_case: Case, gender: string, plural: boolean): string {
  const dative = _case === 'dat' || _case === 'gen';
  if (plural) return 'kei';
  if (dative) return gender === 'fem' ? 'keinere' : 'keim';
  return gender === 'neut' ? 'keis' : 'kei';
}
