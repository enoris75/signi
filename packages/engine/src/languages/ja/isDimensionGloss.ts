import type { ResolvedNounElement } from '../../types.js';

/** Whether a resolved noun slot is a single adjective-definition gloss phrase (see NounPhrase.dimensionGloss). */
export function isDimensionGloss(el: ResolvedNounElement): boolean {
  return el.conjuncts.length === 1 && el.conjuncts[0].dimensionGloss === true;
}
