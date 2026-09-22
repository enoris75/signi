import { isPronominalPossessor } from '@signi/shared';
import type { ResolvedNounPhrase } from '../../types.js';

/** The possessor roles that are the part-whole relation, read from either end (C26). */
const PARTITIVE_ROLES: ReadonlySet<string> = new Set(['whole', 'parts']);

/**
 * Whether a noun phrase's possessor stands in the **part-whole** relation to its head
 * (NounPhrase.possessorRole) — the whole it is a part of, or the parts it is made up of. English
 * never writes either as the Saxon clitic, which would say the possessor owns the head: the head
 * keeps its own determiner and the possessor follows it as an of-phrase — "a part of a keyboard",
 * "a group of canvases", never "a keyboard's part". Only a genitive noun phrase can stand in it; a
 * pronominal possessor stays the possessive pronoun whatever the flag says ("its part").
 */
export function hasPartitivePossessor(np: ResolvedNounPhrase): boolean {
  return !!np.possessorRole && PARTITIVE_ROLES.has(np.possessorRole)
    && !!np.possessor && !isPronominalPossessor(np.possessor);
}
