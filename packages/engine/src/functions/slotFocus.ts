import type { FocusParticle } from '@signi/shared';
import type { ResolvedNounElement } from '../types.js';

/**
 * The focus particle of a whole noun slot (see NounPhrase.focus, C39): the lone phrase's, or nothing.
 *
 * A coordination has none. The particle singles the slot out against its alternatives, and no
 * language writes it once per conjunct — "only the cat and the dog" focuses the pair, which the plan
 * has no way to say and the engines have no way to place, so a focused conjunct is ignored rather
 * than spelled in a position no language uses.
 */
export function slotFocus(el: ResolvedNounElement | undefined): FocusParticle | undefined {
  if (!el || el.conjuncts.length !== 1) return undefined;
  return el.conjuncts[0].focus;
}
