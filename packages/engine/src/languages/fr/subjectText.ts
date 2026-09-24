import type { ResolvedNounElement } from '../../types.js';
import { slotFocus } from '../../functions/slotFocus.js';
import { withFocus } from '../../functions/withFocus.js';
import { FOCUS_WORDS } from './fr.consts.js';
import { coordinate } from './coordinate.js';
import { subjectPhrase } from './subjectPhrase.js';
import { withRelative } from './withRelative.js';

/**
 * A subject slot: each conjunct with its own article/adjectives/relative, coordinated.
 *
 * A coordinated *pronoun* does not keep its clitic subject form in French — "*tu et je mangeons"
 * is not French. It takes the tonic (disjunctive) form, and when the group resolves to the 1st or
 * 2nd person the sentence resumes it with the matching subject clitic: "toi et moi, nous
 * mangeons". A group of 3rd-person nouns needs no resumption ("le chat et le renard mangent").
 *
 * A focus particle singles the whole slot out ("only the cat", "the cat too"): it stands outside
 * everything the phrase itself writes, including a coordination's conjunction (see `withFocus`, C39).
 */
export function subjectText(el: ResolvedNounElement): string {
  if (el.conjuncts.length < 2) return withFocus(coordinate(el, subjectPhrase), slotFocus(el), FOCUS_WORDS);
  const conjuncts = coordinate(el, (np) => {
    const f = np.head.forms;
    return f['person'] ? withRelative(f['disjunctive'] ?? f['base'] ?? '', np) : subjectPhrase(np);
  });
  const person = el.agreement['person'] ?? '3';
  if (person === '3') return conjuncts;
  return `${conjuncts}, ${person === '1' ? 'nous' : 'vous'}`;
}
