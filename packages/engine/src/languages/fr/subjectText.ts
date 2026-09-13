import type { ResolvedNounElement } from '../../types.js';
import { coordinate } from './coordinate.js';
import { subjectPhrase } from './subjectPhrase.js';

/**
 * A subject slot: each conjunct with its own article/adjectives/relative, coordinated.
 *
 * A coordinated *pronoun* does not keep its clitic subject form in French — "*tu et je mangeons"
 * is not French. It takes the tonic (disjunctive) form, and when the group resolves to the 1st or
 * 2nd person the sentence resumes it with the matching subject clitic: "toi et moi, nous
 * mangeons". A group of 3rd-person nouns needs no resumption ("le chat et le renard mangent").
 */
export function subjectText(el: ResolvedNounElement): string {
  if (el.conjuncts.length < 2) return coordinate(el, subjectPhrase);
  const conjuncts = coordinate(el, (np) => {
    const f = np.head.forms;
    return f['person'] ? (f['disjunctive'] ?? f['base'] ?? '') : subjectPhrase(np);
  });
  const person = el.agreement['person'] ?? '3';
  if (person === '3') return conjuncts;
  return `${conjuncts}, ${person === '1' ? 'nous' : 'vous'}`;
}
