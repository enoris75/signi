import type { ResolvedNounPhrase } from '../types.js';

/**
 * The adjective a phrase's `possessorOwn` flag put at the head of its adjectives, if any — OWN,
 * bound to the possessor rather than listed among the phrase's own modifiers (see
 * NounPhrase.possessorOwn, C37). Six engines need not tell it from an ordinary prenominal
 * adjective; Japanese does, because 自分の replaces the possessor instead of joining it.
 */
export function possessorBound(np: ResolvedNounPhrase): ResolvedNounPhrase['adjectives'][number] | undefined {
  return np.adjectives.find((a) => a.forms['possessor_bound'] === '1');
}
