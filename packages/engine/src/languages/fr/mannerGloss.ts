import type { ResolvedNounElement } from '../../types.js';
import { coordinate } from './coordinate.js';
import { frMannerHead } from './frMannerHead.js';
import { renderNP } from './renderNP.js';

/**
 * A manner-definition gloss fragment ("à vitesse haute", "d'une manière bonne"): the manner noun
 * phrase under the adposition its `mannerRelation` selects. Unlike the dimension gloss it keeps its
 * determiner, so it routes through the contracting/eliding manner head — "de" + "une" → "d'une".
 */
export function mannerGloss(el: ResolvedNounElement): string {
  return coordinate(el, (np) => renderNP(np, frMannerHead(np.head.forms)));
}
