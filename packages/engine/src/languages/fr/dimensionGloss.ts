import { dimensionRelation, type ResolvedNounElement, type ResolvedNounPhrase } from '../../types.js';
import { FR_DIM_PREP } from './fr.consts.js';
import { subjectText } from './subjectText.js';

/**
 * An adjective-definition gloss fragment ("de grande taille"): the dimension noun phrase (its
 * degree adjective already agreed and placed by the ordinary NP path — "grande taille") wrapped in
 * the adposition its `dimensionRelation` selects. The one place a verbless period is a
 * prepositional fragment rather than a bare subject noun phrase — see `renderClause`.
 */
export function dimensionGloss(np: ResolvedNounPhrase, el: ResolvedNounElement): string {
  const prep = FR_DIM_PREP[dimensionRelation(np.head.forms)];
  return `${prep} ${subjectText(el)}`.trim();
}
