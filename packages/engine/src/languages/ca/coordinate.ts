import { joinConjuncts } from '../../functions/joinConjuncts.js';

/**
 * Coordinate an adjective list the way a coordinated noun slot is joined: commas between all but the
 * last pair, *i* before the last ("gran, vell i bonic"). Catalan *i* never changes form.
 */
export function coordinate(parts: string[]): string {
  return joinConjuncts(parts, ', ', () => ' i ');
}
