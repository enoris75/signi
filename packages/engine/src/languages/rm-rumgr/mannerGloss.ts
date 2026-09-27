import type { ResolvedNounElement } from '../../types.js';
import { mannerRelation } from '../../functions/mannerRelation.js';
import { rgPossessedHeadForms } from './rgPossessedHeadForms.js';
import { RG_MANNER_PREP } from './rumgr.consts.js';
import { coordinate } from './coordinate.js';
import { prepDet } from './prepDet.js';
import { renderNP } from './renderNP.js';

/**
 * A manner-definition gloss fragment ("a gronda sveltezza", "en ina buna moda"): the manner noun
 * phrase under the preposition its `mannerRelation` selects, keeping its determiner, through `prepDet`
 * as the `manner` complement does.
 */
export function mannerGloss(el: ResolvedNounElement): string {
  return coordinate(el, (np) =>
    renderNP(np, (plural, lead) => prepDet(RG_MANNER_PREP[mannerRelation(np.head.forms)], rgPossessedHeadForms(np), plural, lead)),
  );
}
