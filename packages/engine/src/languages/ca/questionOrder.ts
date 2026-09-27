import type { ConceptForms, ResolvedQuestion } from '../../types.js';
import { questionWord } from './questionWord.js';

/**
 * The subject and the predicate of a Catalan clause in the order a wh-question puts them (P09-E6),
 * as the pair `renderClause` writes first. A statement, and a yes/no question, keep theirs. A subject
 * question writes its word in the subject's slot: "qui menja el menjar?". Any other fronts its word
 * and puts the subject right behind the verb group — "què menja el gat?", "on menja el gat el
 * menjar?" — the VSO order Catalan asks in. `verbGroup` is the predicate with no object and no
 * complement; where the full predicate does not open on it (a clitic object leads it, "on el menja
 * el gat?") the subject closes the predicate instead, which is the other order Catalan allows.
 */
export function questionOrder(
  question: ResolvedQuestion | undefined, subject: string, predicate: string, verbGroup: string, verb: ConceptForms,
  // The fronted phrase where it is more than `questionWord`'s word (P09-E14): "de la casa de qui".
  fronted?: string,
): [string, string] {
  if (!question) return [subject, predicate];
  // A possessor question inside the subject fronts the whole subject, which is the statement's own
  // order: "el gat de qui menja el menjar?" (P09-E14) — the colloquial register; extraction from a
  // preverbal subject would read as the object's question.
  if (question.role === 'possessor' && question.possessed !== 'directObject') return [subject, predicate];
  const word = fronted ?? questionWord(question, verb);
  if (question.role === 'subject') return [word, predicate];
  if (!subject) return [word, predicate];
  const opens = verbGroup && (predicate === verbGroup || predicate.startsWith(`${verbGroup} `));
  return opens
    ? [word, [verbGroup, subject, predicate.slice(verbGroup.length).trim()].filter(Boolean).join(' ')]
    : [word, `${predicate} ${subject}`];
}
