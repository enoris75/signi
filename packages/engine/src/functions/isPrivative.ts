import type { ComplementType } from '@signi/shared';
import type { ResolvedComplement } from '../types.js';

/**
 * Whether a complement is the **privative** — the instrument denied, "cuts the bread **without**
 * the knife" (P09-E2). It is no complement type of its own: a privative is the negated means, as a
 * denied cause is the denied reason, so it is the `instrumental` carrying `Complement.negative`.
 *
 * Unlike the denied cause it takes no negator in front: every language has a preposition for it
 * (*without / senza / sans / sin / sem / ohne* / 〜なしで) that stands where *with* would. The clause
 * stays positive, and no negative concord fires.
 */
export function isPrivative(type: ComplementType, c?: ResolvedComplement): boolean {
  return type === 'instrumental' && c?.negative === true;
}
