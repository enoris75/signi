import type { ConceptForms } from '../types.js';

/** A frequency adverb (always / never), placed differently from manner adverbs in most langs. */
export function isFrequencyAdverb(a?: ConceptForms): boolean {
  return a?.forms['subtype'] === 'frequency';
}
