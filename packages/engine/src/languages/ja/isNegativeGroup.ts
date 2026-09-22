import type { ResolvedNounElement } from '../../types.js';
import { possessorIsNegative } from '../../functions/possessorIsNegative.js';

/**
 * Whether a noun group carries a `no` determiner on any conjunct, or on any conjunct's possessor
 * chain. Such a group closes its どの … も circumfix where its case particle goes (see
 * `jaParticleSegs`), and makes its predicate negative. A `no` possessor puts its どの in front of
 * itself and its も after the whole phrase: どの男の家も見ません (A216).
 */
export function isNegativeGroup(el: ResolvedNounElement): boolean {
  return el.conjuncts.some((np) => np.head.forms['definiteness'] === 'no' || possessorIsNegative(np));
}
