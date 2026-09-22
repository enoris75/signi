import type { ComplementType } from '@signi/shared';
import type { ResolvedComplement, ResolvedNounElement } from '../types.js';

/**
 * The complement map a complement-definition gloss stands for (see NounPhrase.complementGloss): the
 * verbless subject taken as the one complement of the type it names, with that complement's
 * specifiers. Each engine hands the map to the renderer a clause's complements go through, so the
 * gloss says exactly what "… eats in all places" says after its verb, in every language.
 *
 * Empty for a slot that is not a gloss (see `isComplementGloss`), which renders nothing.
 */
export function glossComplement(el: ResolvedNounElement): Partial<Record<ComplementType, ResolvedComplement>> {
  const gloss = el.conjuncts.length === 1 ? el.conjuncts[0].complementGloss : undefined;
  if (!gloss) return {};
  return { [gloss.type]: { phrase: el, ...(gloss.specifiers ? { specifiers: gloss.specifiers } : {}) } };
}
