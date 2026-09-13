import { mannerRelation, type ResolvedNounElement } from '../../types.js';
import { itPossessedHeadForms } from './itPossessedHeadForms.js';
import { IT_MANNER_PREP } from './it.consts.js';
import { coordinate } from './coordinate.js';
import { prepDet } from './prepDet.js';
import { renderNP } from './renderNP.js';

/**
 * A manner-definition gloss fragment ("a velocità alta", "in un modo buono"): the manner noun phrase
 * under the adposition its `mannerRelation` selects. Unlike the dimension gloss it keeps the
 * determiner and so routes through `prepDet` — the same fusing path the `manner` complement uses —
 * so "a" + a definite article would fuse ("alla …") while the indefinite/quantifier stays apart
 * ("in un modo", "a tutti i tempi", "a nessun tempo").
 */
export function mannerGloss(el: ResolvedNounElement): string {
  return coordinate(el, (np) =>
    renderNP(np, (plural, lead) => prepDet(IT_MANNER_PREP[mannerRelation(np.head.forms)], itPossessedHeadForms(np), plural, lead)),
  );
}
