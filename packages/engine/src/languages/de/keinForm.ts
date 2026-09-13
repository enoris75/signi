import type { Case } from './de.types.js';

// "kein" (no), declined like ein- but with a plural (keine / keinen in the dative,
// keiner in the genitive).
export function keinForm(_case: Case, gender: string, plural: boolean): string {
  if (plural) return _case === 'dat' ? 'keinen' : _case === 'gen' ? 'keiner' : 'keine';
  if (_case === 'acc') return gender === 'masc' ? 'keinen' : gender === 'fem' ? 'keine' : 'kein';
  if (_case === 'dat') return gender === 'fem' ? 'keiner' : 'keinem';
  if (_case === 'gen') return gender === 'fem' ? 'keiner' : 'keines';
  return gender === 'fem' ? 'keine' : 'kein'; // nominative: masc/neut kein, fem keine
}
