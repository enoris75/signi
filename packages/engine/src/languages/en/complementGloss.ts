import type { ResolvedNounElement } from '../../types.js';
import { glossComplement } from '../../functions/glossComplement.js';
import { complementsPhrase } from './complementsPhrase.js';

/**
 * A complement-definition gloss fragment ("in all places", "to a higher place"): the place noun
 * phrase rendered as the locative or direction complement it names, by the renderer a clause's
 * complements take — so the preposition, a hearth idiom ("at home") and a relation's goal form
 * ("into") are the complement's own. There is no verb, so nothing the verb would pick applies.
 */
export function complementGloss(el: ResolvedNounElement): string {
  return complementsPhrase(glossComplement(el));
}
