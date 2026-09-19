import type { ConceptForms } from '../../types.js';

/**
 * Whether a clause of possession is said with the existential ある, its object marked が: the verb's
 * lexeme is marked `inanimate_aru` (HAVE, whose 持つ is holding) and the owner is not animate. A thing
 * has its parts by their being there: 壁がある場所 "a place that has walls", 家は窓があります "the house has
 * windows". A person or an animal holds what it has, and keeps 持つ (本を持っている猫).
 */
export function isPossessiveExistential(verb: ConceptForms, animateOwner: boolean): boolean {
  return verb.forms['inanimate_aru'] === '1' && !animateOwner;
}
