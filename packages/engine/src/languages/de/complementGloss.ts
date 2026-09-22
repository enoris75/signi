import type { ResolvedNounElement } from '../../types.js';
import { glossComplement } from '../../functions/glossComplement.js';
import { complementsPhrase } from './complementsPhrase/index.js';

/**
 * A complement-definition gloss fragment ("an allen Orten", "zu einem höheren Ort"): the place noun
 * phrase rendered as the locative or direction complement it names, by the renderer a clause's
 * complements take — so the preposition, the case it governs (a place's dative, the accusative of
 * motion-into), the in+dem → "im" fusion and a hearth idiom ("zu Hause") are the complement's own.
 * There is no verb, so nothing the verb would pick applies.
 */
export function complementGloss(el: ResolvedNounElement): string {
  return complementsPhrase(glossComplement(el));
}
