import { joinConjuncts } from '../../resolved/joinConjuncts.js';

/**
 * Coordinate an adjective list the way a coordinated noun slot is joined: commas between all but
 * the last pair, the conjunction only before the last ("grande, viejo y hermoso") — not "y"
 * repeated between every pair. "y" becomes "e" before an i-/hi- sound (but not "hie-").
 */
export function coordinate(parts: string[]): string {
  return joinConjuncts(parts, ', ', (next) => (/^(i|hi(?!e))/i.test(next) ? ' e ' : ' y '));
}
