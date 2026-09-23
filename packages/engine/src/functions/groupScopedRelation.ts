import {
  DEFAULT_LOCATIVE_SPECIFIER,
  GROUP_SCOPED_SPECIFIERS,
  GROUP_SCOPED_TEMPORAL_RELATIONS,
  type ComplementType,
  type PathSpecifier,
  type TemporalRelation,
} from '@signi/shared';
import type { ResolvedComplement } from '../types.js';
import { directionSpecifier } from './directionSpecifier.js';
import { pathSpecifier } from './pathSpecifier.js';
import { temporalRelation } from './temporalRelation.js';

/**
 * The relation of a complement, when it is one whose adposition scopes over the whole coordinated
 * landmark rather than being repeated on each conjunct — `between`, of a place (P09-E1 D2, see
 * `GROUP_SCOPED_SPECIFIERS`) or of a time (P09-E20 D2, see `GROUP_SCOPED_TEMPORAL_RELATIONS`).
 * Undefined for every other relation and every complement that has none, which is what tells an
 * engine to keep distributing its preposition as it always has. Callers only test it for truth, and
 * lift the same `between` word for the two families.
 *
 * The three spatial complements read the relation as they do everywhere else: a route and a locative
 * through `pathSpecifier` with their own default, a direction through `directionSpecifier`, which
 * has none. The temporal reads `temporalRelation`, whose default `at` distributes.
 */
export function groupScopedRelation(
  type: ComplementType,
  c: Pick<ResolvedComplement, 'specifiers'>,
): PathSpecifier | TemporalRelation | undefined {
  if (type === 'temporal') {
    const relation = temporalRelation(c);
    return GROUP_SCOPED_TEMPORAL_RELATIONS.has(relation) ? relation : undefined;
  }
  const spec = type === 'route' ? pathSpecifier(c)
    : type === 'locative' ? pathSpecifier(c, DEFAULT_LOCATIVE_SPECIFIER)
    : type === 'direction' ? directionSpecifier(c)
    : undefined;
  return spec && GROUP_SCOPED_SPECIFIERS.has(spec) ? spec : undefined;
}
