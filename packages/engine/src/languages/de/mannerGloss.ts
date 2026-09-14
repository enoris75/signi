import type { ResolvedNounElement } from '../../types.js';
import { firstConjunct } from '../../resolved/firstConjunct.js';
import { elementPhrase } from './elementPhrase.js';
import { mannerPrepCase } from './mannerPrepCase.js';

/**
 * A manner-definition gloss fragment ("mit hoher Geschwindigkeit", "auf eine gute Weise"): the
 * manner noun phrase under the preposition + case the `manner` complement chooses (`mannerPrepCase`:
 * mode "auf" + accusative, means/measure "mit" + dative, a temporal noun "zu" + dative, similative
 * "wie" + nominative). The element is single-conjunct (see `isMannerGloss`), so its head noun fixes
 * the case for the whole fragment; `elementPhrase` supplies the determiner and declines the adjective
 * by that case, so the preposition leads bare — exactly as the dimension gloss leads with a bare
 * "von"/"bei". The authored glosses are never definite, so no fusion ("zur") is lost.
 */
export function mannerGloss(el: ResolvedNounElement): string {
  const [prep, _case] = mannerPrepCase(firstConjunct(el).head.forms);
  return `${prep} ${elementPhrase(el, _case)}`.trim();
}
