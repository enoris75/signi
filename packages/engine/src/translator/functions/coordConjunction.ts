import type { CoordConjunction } from '@signi/shared';
import { canCoordinateImperative } from '@signi/shared';

/**
 * The conjunction joining a coordination, normalised for the mood of the pair. Only four of the
 * six can join two commands (see IMPERATIVE_COORD_CONJUNCTIONS); the UI never offers the other
 * two under an imperative, but a stale or hand-built plan that asks for one falls back to the
 * plain copulative rather than losing the second command.
 */
export function coordConjunction(conjunction: CoordConjunction, imperative: boolean): CoordConjunction {
  return imperative && !canCoordinateImperative(conjunction) ? 'and' : conjunction;
}
