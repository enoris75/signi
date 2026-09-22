import type { ResolvedNounElement } from '../../types.js';
import { glossComplement } from '../../functions/glossComplement.js';
import { complementsPhrase } from './complementsPhrase.js';

/**
 * A complement-definition gloss fragment ("en todos los lugares", "a un lugar más alto"): the place
 * noun phrase rendered as the locative or direction complement it names, by the renderer a clause's
 * complements take — so the preposition's fusion with the article ("al") and a hearth idiom ("en
 * casa") are the complement's own. There is no verb, so no subject to agree with and no motion verb
 * to read.
 */
export function complementGloss(el: ResolvedNounElement): string {
  return complementsPhrase(glossComplement(el), {}, '');
}
