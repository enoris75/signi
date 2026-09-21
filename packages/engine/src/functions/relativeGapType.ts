import { COMPLEMENT_RENDER_ORDER, type ComplementType } from '@signi/shared';
import type { ResolvedRelativeClause } from '../types.js';

const COMPLEMENT_ROLES = new Set<string>(COMPLEMENT_RENDER_ORDER);

/**
 * The complement slot a relative clause's head fills — `'locative'` for "the house where the cat
 * is" — or `undefined` where the gap is the subject, the direct object, a possessor or a passive's
 * agent. It is the narrowing of `headRole`, whose other members are those four roles.
 *
 * A clause's gap is not in its `complements`: `relativeGapComplement` renders it separately, as the
 * relativizer. So an engine that reads the complements to decide anything about the *predication* —
 * Spanish and Portuguese pick `estar` for a place and `ser` for everything else — has to be told
 * which slot the gap stands in, or it sees a clause that predicates nothing (A199).
 */
export function relativeGapType(rel: ResolvedRelativeClause): ComplementType | undefined {
  return COMPLEMENT_ROLES.has(rel.headRole) ? (rel.headRole as ComplementType) : undefined;
}
