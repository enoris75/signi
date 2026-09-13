import type { ResolvedNounPhrase } from '../../types.js';
import { nounMods } from './nounMods.js';
import { nounPhrase } from './nounPhrase.js';
import { npAdj } from './npAdj.js';
import { npHasSuperlative } from './npHasSuperlative.js';
import { withRelative } from './withRelative.js';

/** The possessor rendered as a full standalone noun phrase — its own determiner, possessor and
 *  relative clause — the shape both the Saxon prefix and the of-genitive build on. */
export function possessorPhrase(poss: ResolvedNounPhrase): string {
  return withRelative(nounPhrase(poss.head.forms, npAdj(poss), nounMods(poss), poss.possessor, npHasSuperlative(poss)), poss);
}
