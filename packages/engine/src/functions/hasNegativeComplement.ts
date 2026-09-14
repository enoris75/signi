import type { ComplementType } from '@signi/shared';
import type { ResolvedComplement } from '../types.js';

/**
 * Whether any complement carries a `no`-determined phrase — a postverbal negative word. In the
 * Romance languages this obliges the preverbal negator (non / ne / no / não), exactly as a negative
 * direct object does; English and German need no concord. Checks every complement's noun phrase.
 */
export function hasNegativeComplement(
  complements: Partial<Record<ComplementType, ResolvedComplement>> | undefined,
): boolean {
  if (!complements) return false;
  return Object.values(complements).some(
    (c) => c?.phrase.conjuncts.some((np) => np.head.forms['definiteness'] === 'no'),
  );
}
