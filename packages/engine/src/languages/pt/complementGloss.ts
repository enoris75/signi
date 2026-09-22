import type { ResolvedNounElement } from '../../types.js';
import { glossComplement } from '../../functions/glossComplement.js';
import { complementsPhrase } from './complementsPhrase.js';

/**
 * A complement-definition gloss fragment ("em todos os lugares", "a um lugar mais alto"): the place
 * noun phrase rendered as the locative or direction complement it names, by the renderer a clause's
 * complements take — so the preposition's contraction with the article ("no", "ao") and a hearth
 * idiom ("em casa") are the complement's own. There is no verb, so no subject to agree with and no
 * motion verb to read.
 */
export function complementGloss(el: ResolvedNounElement): string {
  return complementsPhrase(glossComplement(el), {}, '');
}
