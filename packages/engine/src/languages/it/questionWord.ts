import type { ConceptForms, ResolvedQuestion } from '../../types.js';
import { objectPreposition } from '../../functions/objectPreposition.js';

const ADVERBIAL: Record<'locative' | 'manner' | 'cause', string> = { locative: 'dove', manner: 'come', cause: 'perché' };

/**
 * The Italian wh-word for a question's gap (P09-E6): *chi* for a person and *che cosa* for a thing,
 * over the subject and the object alike, and *dove*, *come*, *perché* over the adverbial gaps. *che
 * cosa* is the full form of the three Italian uses (*che*, *cosa*), the one no register objects to.
 * A verb that takes its object with a preposition asks with it: "a che cosa pensa il gatto?".
 */
export function questionWord(question: ResolvedQuestion, verb: ConceptForms): string {
  if (question.role !== 'subject' && question.role !== 'directObject') return ADVERBIAL[question.role];
  const word = question.animate ? 'chi' : 'che cosa';
  const prep = question.role === 'directObject' ? objectPreposition(verb) : '';
  return prep ? `${prep} ${word}` : word;
}
