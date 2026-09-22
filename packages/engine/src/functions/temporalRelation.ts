import type { TemporalRelation } from '@signi/shared';
import { DEFAULT_TEMPORAL_RELATION } from '@signi/shared';
import type { ResolvedComplement } from '../types.js';

/**
 * The relation chosen for a `temporal` complement — where the act sits against the time its noun
 * names. A complement naming none simply happens *at* that time, the reading every language spells
 * with a plain adposition (C29).
 */
export function temporalRelation(c: Pick<ResolvedComplement, 'specifiers'>): TemporalRelation {
  return c.specifiers?.find((s) => s.kind === 'temporal')?.value ?? DEFAULT_TEMPORAL_RELATION;
}
