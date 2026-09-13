import type { ResolvedNounElement } from '../../types.js';

export function isMannerGloss(el: ResolvedNounElement): boolean {
  return el.conjuncts.length === 1 && el.conjuncts[0].mannerGloss === true;
}
