import type { ResolvedNounElement } from '../../types.js';

export function isDimensionGloss(el: ResolvedNounElement): boolean {
  return el.conjuncts.length === 1 && el.conjuncts[0].dimensionGloss === true;
}
