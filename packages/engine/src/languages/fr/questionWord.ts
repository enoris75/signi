import type { ConceptForms, ResolvedQuestion } from '../../types.js';
import { objectPreposition } from '../../functions/objectPreposition.js';

const ADVERBIAL: Record<'locative' | 'manner' | 'cause', string> = { locative: 'où', manner: 'comment', cause: 'pourquoi' };

/**
 * The French wh-word for a question's gap (P09-E6). Over the subject it is the whole subject: *qui*
 * for a person, and for a thing *qu'est-ce qui*, since the bare *que* cannot be a subject ("qu'est-ce
 * qui mange la nourriture ?"). Over the object it is *qui* or *que*, the word `frontQuestion` sets
 * before "est-ce que" ("qu'est-ce que le chat mange ?"); after a preposition *que* takes its tonic
 * form *quoi* ("à quoi est-ce qu'il pense ?"). The adverbial gaps are *où*, *comment*, *pourquoi*.
 */
export function questionWord(question: ResolvedQuestion, verb: ConceptForms): string {
  if (question.role === 'subject') return question.animate ? 'qui' : "qu'est-ce qui";
  if (question.role !== 'directObject') return ADVERBIAL[question.role];
  const prep = objectPreposition(verb);
  const word = question.animate ? 'qui' : prep ? 'quoi' : 'que';
  return prep ? `${prep} ${word}` : word;
}
