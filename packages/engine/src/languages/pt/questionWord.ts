import type { ConceptForms, ResolvedQuestion } from '../../types.js';
import { objectPreposition } from '../../functions/objectPreposition.js';

const ADVERBIAL: Record<'locative' | 'manner' | 'cause', string> = { locative: 'onde', manner: 'como', cause: 'por que' };

/**
 * The Portuguese wh-word for a question's gap (P09-E6): *quem* for a person and *o que* for a thing,
 * and *onde*, *como*, *por que* over the adverbial gaps — the Brazilian spelling of the question
 * *por que*, as the rest of this engine is Brazilian. After a preposition the thing is the bare
 * *que* ("em que pensa o gato?" — "de que", never "*de o que").
 */
export function questionWord(question: ResolvedQuestion, verb: ConceptForms): string {
  // The possessor question's *de*-phrase, which fronts alone from the object (P09-E14).
  if (question.role === 'possessor') return 'de quem';
  if (question.role !== 'subject' && question.role !== 'directObject') return ADVERBIAL[question.role];
  const prep = question.role === 'directObject' ? objectPreposition(verb) : '';
  if (question.animate) return prep ? `${prep} quem` : 'quem';
  return prep ? `${prep} que` : 'o que';
}
