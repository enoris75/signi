import type { ConceptForms, ResolvedQuestion } from '../../types.js';
import { type QuestionAdverb, questionAdverbial } from '../../functions/questionAdverbial.js';
import { questionGapComplement, questionStandIn } from '../../functions/questionGapComplement.js';
import { agentPhrase } from './agentPhrase.js';
import { complementsPhrase } from './complementsPhrase.js';
import { objectPreposition } from '../../functions/objectPreposition.js';

const ADVERBIAL: Record<QuestionAdverb, string> = { where: 'dónde', how: 'cómo', why: 'por qué', whereTo: 'adónde', whereFrom: 'de dónde', when: 'cuándo', untilWhen: 'hasta cuándo' };

/**
 * The Spanish wh-word for a question's gap (P09-E6): *quién* for a person and *qué* for a thing, and
 * *dónde*, *cómo*, *por qué* over the adverbial gaps — every one with the accent that marks it
 * interrogative, which the relativizer's *donde* does not carry. A person asked about as the object
 * takes the personal *a* its answer would ("¿a quién ve el gato?"), unless the verb refuses it
 * (`object_no_a`), and a verb that marks every object with it (`object_a`) or with a preposition of
 * its own (`object_prep`) asks with that: "¿a qué sigue el perro?" (see `takesPersonalA`).
 *
 * A complement gap keeps its relation (P09-E15): the word is *quién* / *qué* rendered through the
 * complement path, preposition and all — "debajo de qué", "gracias a quién", "con qué", and the
 * personal *a* the terminus already has, "a quién". A plain direction or source is *adónde* / *de
 * dónde*, a time *cuándo* or *hasta cuándo* (`questionAdverbial`); the negative cause is "por culpa de
 * quién".
 */
export function questionWord(question: ResolvedQuestion, verb: ConceptForms): string {
  // The possessor question's *de*-phrase, which fronts alone from the object (P09-E14).
  if (question.role === 'possessor') return 'de quién';
  // A passive's agent asked about is the by-phrase over the stand-in (P09-E16): *por quién*, and *por qué cosa* for a thing, since *por qué* is *why*.
  if (question.role === 'agent') return agentPhrase(questionStandIn(question, { base: question.animate ? 'quién' : 'qué cosa' })).replace(/\s+/g, ' ').trim();
  const adverb = questionAdverbial(question);
  if (adverb) return ADVERBIAL[adverb];
  const gap = questionGapComplement(question, { base: question.animate ? 'quién' : 'qué' });
  // The route's *por* over *qué* would be the *why* of "¿por qué?", so a place gone through is asked
  // *por dónde*, as Spanish asks it anyway (P09-E15).
  const text = gap ? complementsPhrase(gap, {}, verb.conceptId).replace(/\s+/g, ' ').trim() : '';
  if (gap) return text === 'por qué' ? 'por dónde' : text;
  const word = question.animate ? 'quién' : 'qué';
  if (question.role === 'subject') return word;
  const personalA = verb.forms['object_no_a'] !== '1' && (question.animate || verb.forms['object_a'] === '1');
  const prep = objectPreposition(verb) || (personalA ? 'a' : '');
  return prep ? `${prep} ${word}` : word;
}
