import type { ConceptForms, ResolvedModal } from '../types.js';
import { isNegativeAdverb } from './isNegativeAdverb.js';

/**
 * Does *any* adverb in the verb group — the main verb's `modifier` or any modal's — carry
 * negative polarity? A negative adverb forces sentential negation onto the finite element no
 * matter which verb it modifies ("I **never** wanted to go" ⇒ negate the finite "want").
 */
export function groupHasNegativeAdverb(vp: {
  modifier?: ConceptForms;
  modals: ResolvedModal[];
}): boolean {
  return isNegativeAdverb(vp.modifier) || vp.modals.some((m) => isNegativeAdverb(m.modifier));
}
