import type { ResolvedNounElement } from '../../types.js';

/**
 * Whether a noun group carries a `no` determiner on any conjunct. Such a group closes its どの … も
 * circumfix where its case particle goes (see `jaParticleSegs`), and makes its predicate negative.
 */
export function isNegativeGroup(el: ResolvedNounElement): boolean {
  return el.conjuncts.some((np) => np.head.forms['definiteness'] === 'no');
}
