import type { ResolvedNounElement } from '../../types.js';

/**
 * Whether a resolved noun slot is a single headless relative-clause gloss phrase (see
 * NounPhrase.relativeGloss): flagged, and carrying the relative it says. A flag with no relative
 * to say is ignored, and the phrase renders as the plain noun phrase it is.
 */
export function isRelativeGloss(el: ResolvedNounElement): boolean {
  return el.conjuncts.length === 1 && el.conjuncts[0].relativeGloss === true && !!el.conjuncts[0].relative;
}
