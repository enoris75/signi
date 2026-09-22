import type { ResolvedNounElement } from '../types.js';

/**
 * Whether a resolved noun slot is a single complement-definition gloss phrase (see
 * NounPhrase.complementGloss). A coordination is not one, even of flagged conjuncts, as with the
 * manner and dimension glosses.
 */
export function isComplementGloss(el: ResolvedNounElement): boolean {
  return el.conjuncts.length === 1 && el.conjuncts[0].complementGloss !== undefined;
}
