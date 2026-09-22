import { isPronominalPossessor } from '@signi/shared';
import type { ResolvedNounPhrase } from '../types.js';

/**
 * Whether a noun phrase's **possessor chain** holds a `no`: "la casa di nessun uomo", "the book of the
 * house of no man". Such a possessor is a negative word like the phrase's own `no` determiner, so
 * after the verb it obliges the Romance preverbal negator ("il gatto non vede la casa di nessun uomo"),
 * and in Japanese the どの…も circumfix closes around the whole phrase, not on the possessor
 * (どの男の家も見ません). The phrase's own determiner is not read here, only its possessors'; a
 * pronominal possessor ("his") carries no determiner and ends the chain (A216).
 */
export function possessorIsNegative(np: ResolvedNounPhrase): boolean {
  for (let p = np.possessor; p && !isPronominalPossessor(p); p = p.possessor) {
    if (p.head.forms['definiteness'] === 'no') return true;
  }
  return false;
}
