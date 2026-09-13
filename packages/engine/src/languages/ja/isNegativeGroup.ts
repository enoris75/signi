import type { ResolvedNounElement } from '../../types.js';

/**
 * Whether a noun group carries a `no` determiner on any conjunct. Such a group ends in the
 * circumfix's も (laid down by npSegs), which replaces the case particle the group would otherwise
 * take — so every site that appends が/を/に/で after the group skips it when this is true.
 */
export function isNegativeGroup(el: ResolvedNounElement): boolean {
  return el.conjuncts.some((np) => np.head.forms['definiteness'] === 'no');
}
