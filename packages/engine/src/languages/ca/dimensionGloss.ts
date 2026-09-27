import type { ResolvedNounElement, ResolvedNounPhrase } from '../../types.js';
import { dimensionRelation } from '../../functions/dimensionRelation.js';
import { CA_DIM_PREP } from './ca.consts.js';
import { caSurface } from './caSurface.js';
import { subjectText } from './subjectText.js';

/**
 * An adjective-definition gloss fragment ("de mida gran"): the dimension noun phrase (its degree
 * adjective already agreed and placed by the ordinary NP path — "mida gran") wrapped in the
 * adposition its `dimensionRelation` selects. The one place a verbless period is a prepositional
 * fragment rather than a bare subject noun phrase — see `renderClause`.
 */
export function dimensionGloss(np: ResolvedNounPhrase, el: ResolvedNounElement): string {
  const prep = CA_DIM_PREP[dimensionRelation(np.head.forms)];
  return caSurface(`${prep} ${subjectText(el)}`.trim());
}
