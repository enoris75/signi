import type { ConceptForms, ResolvedQuestion } from '../../types.js';
import { questionWord } from './questionWord.js';

/**
 * The subject and the predicate of an Italian clause in the order a wh-question puts them (P09-E6),
 * as the pair `renderClause` writes first. A statement, and a yes/no question, keep theirs. A subject
 * question writes its word in the subject's slot: "chi mangia il cibo?". Any other fronts its word
 * and moves the subject behind the predicate, the end of the clause, where Italian puts a subject the
 * question is not about: "che cosa mangia il gatto?", "dove mangia il cibo il gatto?". A dropped
 * pronoun subject leaves only the verb: "perché mangio?". *dove* and *come* elide before the copula's
 * *è*, as they always do in writing: "dov'è il gatto?", "com'è il gatto?".
 */
export function questionOrder(
  question: ResolvedQuestion | undefined, subject: string, predicate: string, verb: ConceptForms,
): [string, string] {
  if (!question) return [subject, predicate];
  const word = questionWord(question, verb);
  if (question.role === 'subject') return [word, predicate];
  const body = [predicate, subject].filter(Boolean).join(' ');
  return (word === 'dove' || word === 'come') && /^è( |$)/.test(body) ? [`${word.slice(0, -1)}'${body}`, ''] : [word, body];
}
