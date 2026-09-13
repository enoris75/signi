import { isPronominalPossessor, type ResolvedNounPhrase } from '../../types.js';

/**
 * Whether a possessor is post-modified — so heavy that the Saxon clitic "'s" would land on the
 * wrong word (the last word of a relative clause) rather than on the possessor's head. English
 * forbids the Saxon genitive here (the "group genitive" constraint) and uses the of-genitive
 * instead. A relative clause is the post-modifier; it propagates up a possessor chain, since a
 * possessor whose own possessor is post-modified is itself rendered with a trailing of-phrase.
 */
export function isPostModified(np: ResolvedNounPhrase): boolean {
  // A pronominal possessor ("his") is a bare prenominal word — never post-modified — so only a
  // genitive possessor can propagate post-modification up the chain.
  return !!np.relative || (!!np.possessor && !isPronominalPossessor(np.possessor) && isPostModified(np.possessor));
}
