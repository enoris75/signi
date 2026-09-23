import type { ConceptForms, ResolvedQuestion } from '../../types.js';
import { objectPreposition } from '../../functions/objectPreposition.js';

const ADVERBIAL: Record<'locative' | 'manner' | 'cause', string> = { locative: 'dónde', manner: 'cómo', cause: 'por qué' };

/**
 * The Spanish wh-word for a question's gap (P09-E6): *quién* for a person and *qué* for a thing, and
 * *dónde*, *cómo*, *por qué* over the adverbial gaps — every one with the accent that marks it
 * interrogative, which the relativizer's *donde* does not carry. A person asked about as the object
 * takes the personal *a* its answer would ("¿a quién ve el gato?"), unless the verb refuses it
 * (`object_no_a`), and a verb that marks every object with it (`object_a`) or with a preposition of
 * its own (`object_prep`) asks with that: "¿a qué sigue el perro?" (see `takesPersonalA`).
 */
export function questionWord(question: ResolvedQuestion, verb: ConceptForms): string {
  // The possessor question's *de*-phrase, which fronts alone from the object (P09-E14).
  if (question.role === 'possessor') return 'de quién';
  if (question.role !== 'subject' && question.role !== 'directObject') return ADVERBIAL[question.role];
  const word = question.animate ? 'quién' : 'qué';
  if (question.role === 'subject') return word;
  const personalA = verb.forms['object_no_a'] !== '1' && (question.animate || verb.forms['object_a'] === '1');
  const prep = objectPreposition(verb) || (personalA ? 'a' : '');
  return prep ? `${prep} ${word}` : word;
}
