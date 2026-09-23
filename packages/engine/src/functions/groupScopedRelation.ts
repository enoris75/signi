import { DEFAULT_LOCATIVE_SPECIFIER, GROUP_SCOPED_SPECIFIERS, type ComplementType, type PathSpecifier } from '@signi/shared';
import type { ResolvedComplement } from '../types.js';
import { directionSpecifier } from './directionSpecifier.js';
import { pathSpecifier } from './pathSpecifier.js';

/**
 * The spatial relation of a complement, when it is one whose adposition scopes over the whole
 * coordinated landmark rather than being repeated on each conjunct — `between` (P09-E1 D2, see
 * `GROUP_SCOPED_SPECIFIERS`). Undefined for every other relation and every complement that has none,
 * which is what tells an engine to keep distributing its preposition as it always has.
 *
 * The three spatial complements read the relation as they do everywhere else: a route and a locative
 * through `pathSpecifier` with their own default, a direction through `directionSpecifier`, which
 * has none.
 */
export function groupScopedRelation(type: ComplementType, c: Pick<ResolvedComplement, 'specifiers'>): PathSpecifier | undefined {
  const spec = type === 'route' ? pathSpecifier(c)
    : type === 'locative' ? pathSpecifier(c, DEFAULT_LOCATIVE_SPECIFIER)
    : type === 'direction' ? directionSpecifier(c)
    : undefined;
  return spec && GROUP_SCOPED_SPECIFIERS.has(spec) ? spec : undefined;
}
