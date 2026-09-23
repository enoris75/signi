import type { ResolvedNounPhrase } from '../../types.js';

/**
 * Whether a subject counts as animate for the existential verb: any conjunct that is a person
 * (a pronoun) or an animal / human noun takes いる, anything else ある (猫は家にいます, 本は家にあります).
 * An indefinite pronoun that stands for a **thing** (`thing`: SOMETHING, 何か) has a person for
 * agreement, but is no one: 家に何かがあります, not 何かがいます (P09-E6 D5).
 */
export function isAnimate(conjuncts: ResolvedNounPhrase[]): boolean {
  return conjuncts.some((np) => np.head.forms['animate'] === '1' || (!!np.head.forms['person'] && np.head.forms['thing'] !== '1'));
}
