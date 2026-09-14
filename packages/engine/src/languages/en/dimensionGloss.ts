import type { ResolvedNounElement, ResolvedNounPhrase } from '../../types.js';
import { dimensionRelation } from '../../functions/dimensionRelation.js';
import { DIM_PREP } from './en.consts.js';
import { subjectText } from './subjectText.js';

/**
 * An adjective-definition gloss fragment ("of great size"): the dimension noun phrase (its degree
 * adjective already agreed and placed by the ordinary NP path — "great size") wrapped in the
 * adposition its `dimensionRelation` selects. The one place a verbless period is a prepositional
 * fragment rather than a bare subject noun phrase — see `renderClause`.
 */
export function dimensionGloss(np: ResolvedNounPhrase, el: ResolvedNounElement): string {
  const prep = DIM_PREP[dimensionRelation(np.head.forms)];
  return `${prep} ${subjectText(el)}`.trim();
}
