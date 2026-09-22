import type { ResolvedNounElement } from '../../types.js';
import { slotFocus } from '../../functions/slotFocus.js';
import { withFocus } from '../../functions/withFocus.js';
import { FOCUS_WORDS } from './en.consts.js';
import { coordinate } from './coordinate.js';
import { subjectPhrase } from './subjectPhrase.js';
import { withRelative } from './withRelative.js';

/** A subject slot: each conjunct with its own relative clause, coordinated. */
// A focus particle singles the whole slot out ("only the cat", "the cat too"): it stands outside
// everything the phrase itself writes, including a coordination's conjunction (see `withFocus`, C39).
export function subjectText(el: ResolvedNounElement): string {
  return withFocus(coordinate(el, (np) => withRelative(subjectPhrase(np), np)), slotFocus(el), FOCUS_WORDS);
}
