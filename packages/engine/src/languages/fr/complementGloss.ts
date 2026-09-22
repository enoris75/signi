import type { ResolvedNounElement } from '../../types.js';
import { glossComplement } from '../../functions/glossComplement.js';
import { complementsPhrase } from './complementsPhrase.js';

/**
 * A complement-definition gloss fragment ("dans tous les lieux", "à un lieu plus haut"): the place
 * noun phrase rendered as the locative or direction complement it names, by the renderer a clause's
 * complements take — so the preposition's fusion with the article ("au", "aux"), a land's "en" and a
 * hearth idiom ("à la maison") are the complement's own. There is no verb, so no subject to agree
 * with and no verb-fixed preposition.
 */
export function complementGloss(el: ResolvedNounElement): string {
  return complementsPhrase(glossComplement(el));
}
