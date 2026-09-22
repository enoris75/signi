import type { ResolvedNounElement } from '../../types.js';
import { slotFocus } from '../../functions/slotFocus.js';
import { withFocus } from '../../functions/withFocus.js';
import { FOCUS_WORDS } from './pt.consts.js';
import { coordinateElement } from './coordinateElement.js';
import { ptAdj } from './ptAdj.js';
import { ptPossessiveWord } from './ptPossessiveWord.js';
import { subjectPhrase } from './subjectPhrase.js';
import { withRelative } from './withRelative.js';

/** A subject slot: each conjunct with its own article/adjectives/relative, coordinated. */
// A focus particle singles the whole slot out ("only the cat", "the cat too"): it stands outside
// everything the phrase itself writes, including a coordination's conjunction (see `withFocus`, C39).
export function subjectText(el: ResolvedNounElement): string {
  return withFocus(
    coordinateElement(el, (np) => withRelative(subjectPhrase(np.head.forms, ptAdj(np), ptPossessiveWord(np)), np)),
    slotFocus(el), FOCUS_WORDS,
  );
}
