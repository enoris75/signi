import type { ResolvedNounElement, ResolvedNounPhrase } from '../../types.js';
import { dimensionRelation } from '../../functions/dimensionRelation.js';
import { IT_DIM_PREP } from './it.consts.js';
import { subjectText } from './subjectText.js';

/**
 * An adjective-definition gloss fragment ("di grande dimensione"): the dimension noun phrase (its
 * degree adjective already agreed and placed attributively by the ordinary NP path — "grande
 * dimensione") wrapped in the adposition its `dimensionRelation` selects. The one place a verbless
 * period is a prepositional fragment rather than a bare subject noun phrase — see `renderClause`.
 */
export function dimensionGloss(np: ResolvedNounPhrase, el: ResolvedNounElement): string {
  const prep = IT_DIM_PREP[dimensionRelation(np.head.forms)];
  return `${prep} ${subjectText(el)}`.trim();
}
