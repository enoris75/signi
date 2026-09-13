import type { Case } from './de.types.js';

// The indefinite article ein-, declined for case/gender. Plural has no indefinite
// article (bare).
export function indefArticle(_case: Case, gender: string, plural: boolean): string {
  if (plural) return '';
  if (_case === 'acc') return gender === 'masc' ? 'einen' : gender === 'fem' ? 'eine' : 'ein';
  if (_case === 'dat') return gender === 'fem' ? 'einer' : 'einem';
  if (_case === 'gen') return gender === 'fem' ? 'einer' : 'eines';
  return gender === 'fem' ? 'eine' : 'ein'; // nominative: masc/neut ein, fem eine
}
