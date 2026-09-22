import type { ResolvedNounElement } from '../../types.js';
import { glossComplement } from '../../functions/glossComplement.js';
import { complementsPhrase } from './complementsPhrase.js';

/**
 * A complement-definition gloss fragment ("in tutti i luoghi", "a un luogo più alto"): the place noun
 * phrase rendered as the locative or direction complement it names, by the renderer a clause's
 * complements take — so the preposition's fusion with the article ("nei luoghi"), the animate goal's
 * "da" and a hearth idiom ("a casa") are the complement's own. There is no verb, so no subject to
 * agree with and no verb-fixed preposition (`direction_prep`).
 */
export function complementGloss(el: ResolvedNounElement): string {
  return complementsPhrase(glossComplement(el), {}, '');
}
