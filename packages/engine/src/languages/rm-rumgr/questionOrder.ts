import type { ConceptForms, ResolvedQuestion } from '../../types.js';
import { questionWord } from './questionWord.js';

/**
 * The subject and the predicate of a clause in the order a wh-question puts them (P09-E6), as the pair
 * `renderClause` writes first. A statement, and a yes/no question, keep theirs — RG's inverted yes/no
 * question ("Mangia il giat la mieur?") is a documented gap (P04-E10 D3, pinned `test.fails`). A
 * subject question writes its word in the subject's slot: "tgi mangia la mieur?". Any other fronts
 * its word and puts the subject behind the predicate, as the `it` engine this was forked from does:
 * "tge mangia il giat?", "tge mangias ti?" (verify the position of a subject behind an object).
 */
export function questionOrder(
  question: ResolvedQuestion | undefined, subject: string, predicate: string, verb: ConceptForms,
  // The fronted phrase where it is more than `questionWord`'s word (P09-E14): "da la chasa da tgi".
  fronted?: string,
): [string, string] {
  if (!question) return [subject, predicate];
  // A possessor question inside the subject fronts the whole subject, the statement's own order (P09-E14).
  if (question.role === 'possessor' && question.possessed !== 'directObject') return [subject, predicate];
  const word = fronted ?? questionWord(question, verb);
  if (question.role === 'subject') return [word, predicate];
  return [word, [predicate, subject].filter(Boolean).join(' ')];
}
