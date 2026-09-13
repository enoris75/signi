import type { ResolvedNounElement } from '../../types.js';

/** Whether a resolved noun slot is a single manner-definition gloss phrase (see NounPhrase.mannerGloss). */
export function isMannerGloss(el: ResolvedNounElement): boolean {
  return el.conjuncts.length === 1 && el.conjuncts[0].mannerGloss === true;
}
