import type { ResolvedComplement } from '../types.js';

/**
 * Whether a complement denies itself rather than the clause — "not because of the dog", which says
 * the act happened and this was not the reason (see `Complement.negative`).
 *
 * Only the `cause` complement is offered it today, and only the cause engines read this. It is a
 * constituent negation: the verb stays positive, and no negative concord fires, so a clause can
 * carry both ("der Kater ist nicht wegen des Hundes nicht müde").
 */
export function causeNegative(c?: ResolvedComplement): boolean {
  return c?.negative === true;
}
