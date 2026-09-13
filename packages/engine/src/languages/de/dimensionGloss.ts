import { dimensionRelation, type ResolvedNounElement, type ResolvedNounPhrase } from '../../types.js';
import { DE_DIM_PREP } from './de.consts.js';
import { elementPhrase } from './elementPhrase.js';

/**
 * An adjective-definition gloss fragment ("von großer Größe"): the dimension noun phrase (its
 * degree adjective declined and placed by the ordinary NP path) rendered in the dative the
 * adposition its `dimensionRelation` selects governs. The one place a verbless period is a
 * prepositional fragment rather than a bare subject noun phrase — see `renderClause`.
 */
export function dimensionGloss(np: ResolvedNounPhrase, el: ResolvedNounElement): string {
  const prep = DE_DIM_PREP[dimensionRelation(np.head.forms)];
  return `${prep} ${elementPhrase(el, 'dat')}`.trim();
}
