import type { ResolvedNounElement } from '../../types.js';
import { dimensionRelation } from '../../functions/dimensionRelation.js';
import { glossComplement } from '../../functions/glossComplement.js';
import { isComplementGloss } from '../../functions/isComplementGloss.js';
import { LT_DIM_PREP } from './lt.consts.js';
import { complementsPhrase } from './complementsPhrase.js';
import { elementText } from './elementText.js';
import { relativeText } from './relativeText.js';
import { withPreposition } from './withPreposition.js';

/**
 * A verbless period that is a definition's fragment rather than a noun phrase, or `undefined` for a
 * plain one:
 *
 * - an adjective gloss (`dimensionGloss`): the genitive of quality, *didelio dydžio* (verify);
 * - a complement gloss (`complementGloss`): the place or direction complement it names, *visose
 *   vietose*, *į aukštesnę vietą*;
 * - a manner gloss (`mannerGloss`): the manner complement, *dideliu greičiu*;
 * - a relative gloss (`relativeGloss`): the head's relative alone, *kuris buvo išsaugotas*.
 */
export function glossText(el: ResolvedNounElement): string | undefined {
  const np = el.conjuncts.length === 1 ? el.conjuncts[0]! : undefined;
  if (!np) return undefined;
  if (np.dimensionGloss) {
    const gov = LT_DIM_PREP[dimensionRelation(np.head.forms)];
    return withPreposition(gov, elementText(el, gov.case));
  }
  if (isComplementGloss(el)) return complementsPhrase(glossComplement(el), { subject: {} });
  if (np.mannerGloss) return complementsPhrase({ manner: { phrase: el } }, { subject: {} });
  if (np.relativeGloss && np.relative) return relativeText(np).replace(/^,\s*/, '').replace(/,$/, '');
  return undefined;
}
