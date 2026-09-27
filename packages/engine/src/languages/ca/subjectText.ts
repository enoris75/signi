import type { ResolvedNounElement } from '../../types.js';
import { slotFocus } from '../../functions/slotFocus.js';
import { withFocus } from '../../functions/withFocus.js';
import { FOCUS_WORDS } from './ca.consts.js';
import { caSurface } from './caSurface.js';
import { coordinateElement } from './coordinateElement.js';
import { caAdj } from './caAdj.js';
import { caPossessiveWord } from './caPossessiveWord.js';
import { subjectPhrase } from './subjectPhrase.js';
import { withRelative } from './withRelative.js';

/**
 * A subject slot: each conjunct with its own article, adjectives and relative, coordinated. A focus
 * particle singles the whole slot out, outside everything the phrase writes ("només el gat", C39).
 */
export function subjectText(el: ResolvedNounElement): string {
  return caSurface(withFocus(
    coordinateElement(el, (np) => withRelative(subjectPhrase(np.head.forms, caAdj(np), caPossessiveWord(np)), np)),
    slotFocus(el), FOCUS_WORDS,
  ));
}
