import type { ComplementType } from '@signi/shared';
import type { ResolvedComplement } from '../../types.js';

/**
 * Split the object complement out of the complements. Japanese is SOV, so `predicateSegs` renders
 * every complement *before* the direct object — which is the wrong side for this one: it predicates
 * of that object and has to follow it, 「文を命令にする」, never 「命令に文をする」. The shared
 * COMPLEMENT_RENDER_ORDER puts it first because in an SVO clause the object already precedes the
 * complements; here the clause builder has to move it across by hand.
 */
export function splitObjectPredicative(
  complements?: Partial<Record<ComplementType, ResolvedComplement>>,
): { objectPredicative?: Partial<Record<ComplementType, ResolvedComplement>>; rest?: Partial<Record<ComplementType, ResolvedComplement>> } {
  const objectPredicative = complements?.['objectPredicative'];
  if (!objectPredicative) return { rest: complements };
  const { objectPredicative: _o, ...rest } = complements;
  return { objectPredicative: { objectPredicative }, rest };
}
