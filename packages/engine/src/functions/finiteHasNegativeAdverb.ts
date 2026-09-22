import type { ConceptForms, ResolvedModal } from '../types.js';
import { isNegativeAdverb } from './isNegativeAdverb.js';

/**
 * Does an adverb in the verb group negate the **finite** element? A modal's own negative adverb
 * does — it is the finite verb, or governed by one that is — and so does the main verb's in a
 * modal-free clause, where the main verb IS the finite one. The main verb's adverb under a modal
 * does not: it denies the group the modal governs (`governedHasNegativeAdverb`, A236).
 *
 * This is what a language with negative concord reads to decide its preverbal negator — Italian's
 * "non", Spanish's "no", Portuguese's "não", French's dropped "pas" and Japanese's ません. The
 * unsplit `groupHasNegativeAdverb` is still what English and German read, which have no inner
 * negator to route the adverb through; it is exactly this predicate OR the governed one, and a
 * clause can carry both at once ("the cat never wants to never eat").
 */
export function finiteHasNegativeAdverb(vp: {
  modifier?: ConceptForms;
  modals: ResolvedModal[];
}): boolean {
  return vp.modals.length > 0
    ? vp.modals.some((m) => isNegativeAdverb(m.modifier))
    : isNegativeAdverb(vp.modifier);
}
