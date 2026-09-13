import type { ResolvedNounElement } from '../../types.js';
import { artForms } from './artForms.js';
import { coordinateElement } from './coordinateElement.js';
import { esAdj } from './esAdj.js';
import { esMannerHead } from './esMannerHead.js';
import { isPlural } from './isPlural.js';
import { withAdj } from './withAdj.js';
import { withRelative } from './withRelative.js';

/**
 * A manner-definition gloss fragment ("a velocidad alta", "de una manera buena"): the manner noun
 * phrase under the adposition its `mannerRelation` selects, keeping its determiner — the same body
 * the `manner` complement builds, so the article fuses with the preposition when definite.
 */
export function mannerGloss(el: ResolvedNounElement): string {
  return coordinateElement(el, (np) => {
    const f = np.head.forms;
    const plural = isPlural(f);
    const word = plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? '');
    const adj = esAdj(np);
    const noun = withAdj(word, adj);
    const af = artForms(f, adj);
    return withRelative(`${esMannerHead(af, plural)} ${noun}`, np);
  });
}
