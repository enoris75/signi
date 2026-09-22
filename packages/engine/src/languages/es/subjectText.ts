import type { ResolvedNounElement } from '../../types.js';
import { slotFocus } from '../../functions/slotFocus.js';
import { withFocus } from '../../functions/withFocus.js';
import { FOCUS_WORDS } from './es.consts.js';
import { coordinateElement } from './coordinateElement.js';
import { esAdj } from './esAdj.js';
import { esPossessiveWord } from './esPossessiveWord.js';
import { subjectPhrase } from './subjectPhrase.js';
import { withRelative } from './withRelative.js';

/** A subject slot: each conjunct with its own article/adjectives/relative, coordinated. */
// A focus particle singles the whole slot out ("only the cat", "the cat too"): it stands outside
// everything the phrase itself writes, including a coordination's conjunction (see `withFocus`, C39).
export function subjectText(el: ResolvedNounElement): string {
  return withFocus(
    coordinateElement(el, (np) => withRelative(subjectPhrase(np.head.forms, esAdj(np), esPossessiveWord(np)), np)),
    slotFocus(el), FOCUS_WORDS,
  );
}
