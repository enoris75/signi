import { isPronominalPossessor } from '@signi/shared';
import { possessorBound } from '../../functions/possessorBound.js';
import type { ResolvedNounPhrase } from '../../types.js';
import { keepsDeterminerBesidePossessive } from './isPostModified.js';

/**
 * Whether a phrase's OWN (`possessorOwn`, C37) goes with a detached possessive rather than with the
 * head's adjectives. OWN is bound to the possessor, and English writes it after the possessive: "my
 * own friend". A head that keeps its determiner sends the possessive to the of-genitive, and OWN goes
 * along, with the dependent possessive: "a friend of my own", "this friend of my own", never "an own
 * friend of mine" (A328).
 */
export function ownDetaches(np: ResolvedNounPhrase): boolean {
  return !!possessorBound(np) && !!np.possessor && isPronominalPossessor(np.possessor)
    && keepsDeterminerBesidePossessive(np.head.forms);
}
