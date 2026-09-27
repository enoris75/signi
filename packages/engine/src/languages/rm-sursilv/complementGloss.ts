import type { ResolvedNounElement } from '../../types.js';
import { glossComplement } from '../../functions/glossComplement.js';
import { complementsPhrase } from './complementsPhrase.js';

/**
 * A complement-definition gloss fragment ("en tut ils lius", "ad in liug pli aut"): the place noun
 * phrase rendered as the locative or direction complement it names, by the renderer a clause's
 * complements take — so the preposition's contraction with the article ("als lieus"), the animate goal's
 * "tier" and a hearth idiom ("a casa") are the complement's own. There is no verb, so no subject to
 * agree with and no verb-fixed preposition (`direction_prep`).
 */
export function complementGloss(el: ResolvedNounElement): string {
  return complementsPhrase(glossComplement(el), {}, '');
}
