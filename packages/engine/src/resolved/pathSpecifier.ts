import type { PathSpecifier } from '@signi/shared';
import { DEFAULT_ROUTE_SPECIFIER } from '@signi/shared';
import type { ResolvedComplement } from '../types.js';

/**
 * The spatial relation chosen for a `route` or `locative` complement. The two share the set of
 * relations but not the default, so the caller passes the fallback its complement falls back on:
 * a bare route is a traversal (`through`), a bare locative is containment (`in`).
 */
export function pathSpecifier(c: ResolvedComplement, fallback: PathSpecifier = DEFAULT_ROUTE_SPECIFIER): PathSpecifier {
  return c.specifiers?.find((s) => s.kind === 'path')?.value ?? fallback;
}
