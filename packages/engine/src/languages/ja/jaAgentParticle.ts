import type { ComplementType } from '@signi/shared';
import type { ResolvedComplement } from '../../types.js';
import { objectPredication } from '../../functions/objectPredication.js';

/**
 * The particle a passive's agent takes: に, or the compound によって where the clause already spends
 * its に on something else — the dative recipient of a ditransitive, or the factitive object complement
 * — because two に in one clause cannot be told apart: 本は猫によって子供にあげられます, never 「猫に子供に」.
 */
export function jaAgentParticle(complements?: Partial<Record<ComplementType, ResolvedComplement>>): string {
  const factitive = complements?.['objectPredicative'];
  const niIsTaken = !!complements?.['terminus']
    || (!!factitive && objectPredication(factitive) !== 'essive');
  return niIsTaken ? 'によって' : 'に';
}
