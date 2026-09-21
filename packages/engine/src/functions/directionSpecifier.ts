import type { PathSpecifier } from '@signi/shared';
import type { ResolvedComplement } from '../types.js';

/**
 * The spatial relation chosen for a `direction` complement, or **undefined** where none was — which
 * is a meaning and not a gap (see `PathSpecifier`). A bare direction is the plain goal, the thing
 * moved towards ("goes to the house"); one carrying a relation says where the motion ends up with
 * respect to its landmark ("jumps **into** the air").
 *
 * This is why the direction cannot go through `pathSpecifier`, which every other specifier-bearing
 * complement uses: that one answers with a fallback, because a route and a locative always stand in
 * *some* relation to their noun and only differ in which one is unmarked.
 */
export function directionSpecifier(c: Pick<ResolvedComplement, 'specifiers'>): PathSpecifier | undefined {
  return c.specifiers?.find((s) => s.kind === 'path')?.value;
}
