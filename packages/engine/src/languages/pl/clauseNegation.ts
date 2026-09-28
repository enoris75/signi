import type { ComplementType } from '@signi/shared';
import type { ResolvedComplement, ResolvedNounElement, ResolvedVerbPhrase } from '../../types.js';
import { finiteHasNegativeAdverb } from '../../functions/finiteHasNegativeAdverb.js';
import { governedHasNegativeAdverb } from '../../functions/governedHasNegativeAdverb.js';
import { hasNegativeComplement } from '../../functions/hasNegativeComplement.js';
import { hasNegativePossessorComplement } from '../../functions/hasNegativePossessorComplement.js';
import { possessorIsNegative } from '../../functions/possessorIsNegative.js';

/**
 * Where a clause writes *nie* (P05 §2.2). Polish has full negative concord: every negative word —
 * *nigdy*, *nikt*, *nic*, *żaden* — takes *nie* on the verb as well, before the subject or after it
 * (*nikt nie je*, *kot nigdy nie je*, *kot nie je żadnej myszy*). `finite` is the *nie* before the
 * finite verb; `inner` the one before a group a modal governs (*chce nie jeść*), which a negative word
 * after it concords with instead of the finite one (*chce nie jeść żadnej myszy*). Either one puts the
 * direct object in the genitive (`objectGovernment`).
 */
export function clauseNegation(clause: {
  verbPhrase: ResolvedVerbPhrase;
  subjectNegative?: boolean;
  directObject?: ResolvedNounElement;
  complements?: Partial<Record<ComplementType, ResolvedComplement>>;
}): { finite: boolean; inner: boolean } {
  const vp = clause.verbPhrase;
  const inner = vp.modals.length > 0 && (vp.governedNegative === true || governedHasNegativeAdverb(vp) || vp.modals.some((m) => m.negative));
  const objectNegative = clause.directObject?.conjuncts.some((np) => np.head.forms['definiteness'] === 'no' || possessorIsNegative(np)) ?? false;
  const complementNegative = hasNegativeComplement(clause.complements) || hasNegativePossessorComplement(clause.complements);
  const finite = vp.negative === true || clause.subjectNegative === true || finiteHasNegativeAdverb(vp)
    || ((objectNegative || complementNegative) && !inner);
  return { finite, inner };
}
