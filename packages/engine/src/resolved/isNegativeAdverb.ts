import type { ConceptForms } from '../types.js';

/** An adverb whose polarity demands a negated predicate (NEVER → non/ne…pas/nicht/ない). */
export function isNegativeAdverb(a?: ConceptForms): boolean {
  return a?.forms['polarity'] === 'negative';
}
