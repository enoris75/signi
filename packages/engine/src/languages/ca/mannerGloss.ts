import type { ResolvedNounElement } from '../../types.js';
import { artForms } from './artForms.js';
import { coordinateElement } from './coordinateElement.js';
import { caAdj } from './caAdj.js';
import { caMannerHead } from './caMannerHead.js';
import { isPlural } from './isPlural.js';
import { joinHead } from './joinHead.js';
import { withAdj } from './withAdj.js';
import { withRelative } from './withRelative.js';

/**
 * A manner-definition gloss fragment ("a velocitat alta", "d'una manera bona"): the manner noun phrase
 * under the adposition its `mannerRelation` selects, keeping its determiner — the same body the
 * `manner` complement builds.
 */
export function mannerGloss(el: ResolvedNounElement): string {
  return coordinateElement(el, (np) => {
    const f = np.head.forms;
    const plural = isPlural(f);
    const word = plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? '');
    const adj = caAdj(np);
    const noun = withAdj(word, adj);
    const af = artForms(f, adj);
    return withRelative(joinHead(caMannerHead(af, plural), noun, af, adj), np);
  });
}
