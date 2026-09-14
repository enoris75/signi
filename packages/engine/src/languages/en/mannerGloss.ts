import type { ResolvedNounElement, ResolvedNounPhrase } from '../../types.js';
import { mannerRelation } from '../../functions/mannerRelation.js';
import { MANNER_PREP } from './en.consts.js';
import { subjectText } from './subjectText.js';

/**
 * A manner-definition gloss fragment ("at high speed", "in a good way"): the manner noun phrase —
 * its determiner and any degree adjective already placed by the ordinary NP path — wrapped in the
 * adposition its `mannerRelation` selects. Unlike `dimensionGloss` the article is kept, so the
 * phrase's own `definiteness` gives "a good way" / "all times" / "no time".
 */
export function mannerGloss(np: ResolvedNounPhrase, el: ResolvedNounElement): string {
  const prep = MANNER_PREP[mannerRelation(np.head.forms)];
  return `${prep} ${subjectText(el)}`.trim();
}
