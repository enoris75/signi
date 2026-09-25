import type { ResolvedNounElement } from '../../types.js';
import { slotFocus } from '../../functions/slotFocus.js';
import { withFocus } from '../../functions/withFocus.js';
import { FOCUS_WORDS } from './gsw.consts.js';
import { coordinate } from './coordinate.js';
import { subjectPhrase } from './subjectPhrase.js';

/** A subject slot: each conjunct in the nominative, coordinated. */
// A focus particle singles the whole slot out ("only the cat", "the cat too"): it stands outside
// everything the phrase itself writes, including a coordination's conjunction (see `withFocus`, C39).
export function subjectText(el: ResolvedNounElement): string {
  return withFocus(coordinate(el, subjectPhrase), slotFocus(el), FOCUS_WORDS);
}
