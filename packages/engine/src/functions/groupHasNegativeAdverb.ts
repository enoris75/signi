import type { ConceptForms, ResolvedModal } from '../types.js';
import { isNegativeAdverb } from './isNegativeAdverb.js';

/**
 * Does *any* adverb in the verb group — the main verb's `modifier` or any modal's — carry
 * negative polarity?
 *
 * This is the reading English and German want: both place the adverb inside the group it modifies
 * and need no negator of their own beside it ("wants to never eat", "will nie fressen"), so the one
 * question they ask is whether the clause is denied at all. A language that writes a preverbal
 * negator asks *which* element the adverb denies instead, and reads `finiteHasNegativeAdverb` and
 * `governedHasNegativeAdverb`, which split this predicate in two (A236).
 */
export function groupHasNegativeAdverb(vp: {
  modifier?: ConceptForms;
  modals: ResolvedModal[];
}): boolean {
  return isNegativeAdverb(vp.modifier) || vp.modals.some((m) => isNegativeAdverb(m.modifier));
}
