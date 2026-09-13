import { dimensionRelation, type ResolvedNounElement, type ResolvedNounPhrase } from '../../types.js';
import { ES_DIM_PREP } from './es.consts.js';
import { subjectText } from './subjectText.js';

/**
 * An adjective-definition gloss fragment ("de gran tamaño"): the dimension noun phrase (its degree
 * adjective already agreed and placed by the ordinary NP path — "gran tamaño") wrapped in the
 * adposition its `dimensionRelation` selects. The one place a verbless period is a prepositional
 * fragment rather than a bare subject noun phrase — see `renderClause`.
 */
export function dimensionGloss(np: ResolvedNounPhrase, el: ResolvedNounElement): string {
  const prep = ES_DIM_PREP[dimensionRelation(np.head.forms)];
  return `${prep} ${subjectText(el)}`.trim();
}
