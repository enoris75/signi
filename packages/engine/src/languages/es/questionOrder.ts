import type { ConceptForms, ResolvedQuestion } from '../../types.js';
import { questionWord } from './questionWord.js';

/**
 * The subject and the predicate of a Spanish clause in the order a wh-question puts them (P09-E6),
 * as the pair `renderClause` writes first. A statement, and a yes/no question, keep theirs. A subject
 * question writes its word in the subject's slot: "¿quién come la comida?". Any other fronts its word
 * and puts the subject right behind the verb group — "¿qué come el gato?", "¿dónde come el gato la
 * comida?" — the VSO order Spanish asks in. `verbGroup` is the predicate with no object and no
 * complement; where the full predicate does not open on it (a clitic object leads it, "¿dónde lo come
 * el gato?") the subject closes the predicate instead, which is the other order Spanish allows.
 */
export function questionOrder(
  question: ResolvedQuestion | undefined, subject: string, predicate: string, verbGroup: string, verb: ConceptForms,
): [string, string] {
  if (!question) return [subject, predicate];
  const word = questionWord(question, verb);
  if (question.role === 'subject') return [word, predicate];
  if (!subject) return [word, predicate];
  const opens = verbGroup && (predicate === verbGroup || predicate.startsWith(`${verbGroup} `));
  return opens
    ? [word, [verbGroup, subject, predicate.slice(verbGroup.length).trim()].filter(Boolean).join(' ')]
    : [word, `${predicate} ${subject}`];
}
