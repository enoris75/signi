import type { CauseSentiment } from '@signi/shared';
import type { ResolvedComplement } from '../types.js';

/** The affective stance chosen for a `cause` complement; defaults to `neutral`. */
export function causeSentiment(c: Pick<ResolvedComplement, 'specifiers'>): CauseSentiment {
  return c.specifiers?.find((s) => s.kind === 'sentiment')?.value ?? 'neutral';
}
