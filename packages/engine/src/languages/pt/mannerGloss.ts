import type { ResolvedNounElement } from '../../types.js';
import { coordinateElement } from './coordinateElement.js';
import { isPlural } from './isPlural.js';
import { ptAdj } from './ptAdj.js';
import { ptMannerHead } from './ptMannerHead.js';
import { withAdj } from './withAdj.js';
import { withRelative } from './withRelative.js';

/**
 * A manner-definition gloss fragment ("a velocidade alta", "de uma maneira boa"): the manner noun
 * phrase under the adposition its `mannerRelation` selects, keeping its determiner — the same body
 * the `manner` complement builds, so the article fuses with the preposition when definite.
 */
export function mannerGloss(el: ResolvedNounElement): string {
  return coordinateElement(el, (np) => {
    const f = np.head.forms;
    const plural = isPlural(f);
    const word = plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? '');
    const noun = withAdj(word, ptAdj(np));
    return withRelative(`${ptMannerHead(f, plural)} ${noun}`, np);
  });
}
