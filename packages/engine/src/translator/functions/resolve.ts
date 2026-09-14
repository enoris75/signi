import type { ConceptForms } from '../../types.js';
import type { LexiconLookup } from '../translator.types.js';

export function resolve(conceptId: string, language: string, lookup: LexiconLookup): ConceptForms {
  const entry = lookup(conceptId, language);
  return { conceptId, forms: entry ? { ...entry.forms } : {} };
}
