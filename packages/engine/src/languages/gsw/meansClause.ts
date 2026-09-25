import type { ComplementType } from '@signi/shared';
import type { ResolvedComplement } from '../../types.js';
import { instrumentActionPhrase } from './complementsPhrase/instrumentActionPhrase.js';

/**
 * The means clause `splitMeansClause` lifted out of a clause's complements, rendered with the
 * subject it needs: the pronoun of `doer`, whoever wields the instrument ("…, indem er ein Wort
 * wählt"), or "man" without one (see `meansDoer`). "" when the clause has none.
 */
export function meansClause(
  means: Partial<Record<ComplementType, ResolvedComplement>> | undefined,
  doer?: Record<string, string>,
): string {
  const instrument = means?.['instrumental'];
  return instrument ? (instrumentActionPhrase(instrument, doer) ?? '') : '';
}
