import type { ConceptForms, ResolvedQuestion } from '../../types.js';
import { objectPreposition } from '../../functions/objectPreposition.js';
import { questionWord } from './questionWord.js';

/**
 * The French word opening an **indirect** wh-question (P09-E17). A thing asked about is *ce qui* over
 * the subject and *ce que* over the object — "demande ce qui mange", "demande ce que le chat mange" —
 * where the direct question says *qu'est-ce qui* / *que* ahead of "est-ce que". Every other word is
 * the direct question's (`questionWord`): *qui* for a person, *quoi* after the verb's preposition
 * ("demande à quoi le chat pense"), and *où*, *comment*, *pourquoi*.
 */
export function indirectQuestionWord(question: ResolvedQuestion, verb: ConceptForms): string {
  if (question.animate) return questionWord(question, verb);
  if (question.role === 'subject') return 'ce qui';
  if (question.role === 'directObject' && !objectPreposition(verb)) return 'ce que';
  return questionWord(question, verb);
}
