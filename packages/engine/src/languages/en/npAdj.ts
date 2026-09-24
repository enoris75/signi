import type { ResolvedNounPhrase } from '../../types.js';
import { enAdj } from './enAdj.js';
import { isPostposedEquative } from './isPostposedEquative.js';
import { ownDetaches } from './ownDetaches.js';

/**
 * Join a resolved noun phrase's prenominal adjectives, each carrying its comparative degree. An
 * equative with a standard is not among them: it follows the noun with its standard ("a cat as big as
 * the dog", P09-E18; see `npStandard`). Nor is an OWN that goes with a detached possessive ("a friend
 * of my own", A328; see `ownDetaches`).
 */
export function npAdj(np: ResolvedNounPhrase): string {
  const ownOff = ownDetaches(np);
  return np.adjectives
    .filter((a) => !isPostposedEquative(np, a) && !(ownOff && a.forms['possessor_bound'] === '1'))
    .map(enAdj).filter(Boolean).join(' ');
}
