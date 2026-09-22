import type { ComplementType } from '@signi/shared';
import type { ResolvedComplement } from '../types.js';
import { mannerRelation } from './mannerRelation.js';
import { possessorIsNegative } from './possessorIsNegative.js';

/**
 * Whether any complement conjunct has a `no` in its **possessor chain** — "nella casa di nessun uomo"
 * (see `possessorIsNegative`). The companion of `hasNegativeComplement`, which reads a conjunct's own
 * determiner: a postverbal `no` possessor obliges the Romance preverbal negator the same way, and the
 * Japanese どの…も circumfix around the phrase needs the clause-final ない (A216).
 *
 * It skips a comparison as `hasNegativeComplement` does — a similative `manner` conjunct licenses its
 * own negative word and leaves the clause positive ("il gatto corre come la casa di nessun uomo",
 * A181) — and `countComparisons` puts it back, for Japanese, whose circumfix needs its ない there too.
 */
export function hasNegativePossessorComplement(
  complements: Partial<Record<ComplementType, ResolvedComplement>> | undefined,
  { countComparisons = false }: { countComparisons?: boolean } = {},
): boolean {
  if (!complements) return false;
  return Object.entries(complements).some(([type, c]) => c?.phrase.conjuncts.some((np) =>
    possessorIsNegative(np)
    && (countComparisons || !(type === 'manner' && mannerRelation(np.head.forms) === 'similative'))));
}
