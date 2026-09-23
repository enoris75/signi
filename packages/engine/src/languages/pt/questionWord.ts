import type { ConceptForms, ResolvedQuestion } from '../../types.js';
import { type QuestionAdverb, questionAdverbial } from '../../functions/questionAdverbial.js';
import { questionGapComplement, questionStandIn } from '../../functions/questionGapComplement.js';
import { agentPhrase } from './agentPhrase.js';
import { complementsPhrase } from './complementsPhrase.js';
import { objectPreposition } from '../../functions/objectPreposition.js';

const ADVERBIAL: Record<QuestionAdverb, string> = { where: 'onde', how: 'como', why: 'por que', whereTo: 'aonde', whereFrom: 'de onde', when: 'quando', untilWhen: 'até quando' };

/**
 * The Portuguese wh-word for a question's gap (P09-E6): *quem* for a person and *o que* for a thing,
 * and *onde*, *como*, *por que* over the adverbial gaps — the Brazilian spelling of the question
 * *por que*, as the rest of this engine is Brazilian. After a preposition the thing is the bare
 * *que* ("em que pensa o gato?" — "de que", never "*de o que").
 *
 * A complement gap keeps its relation (P09-E15): the word is *quem* / the bare *que* rendered through
 * the complement path, preposition and all — "debaixo de que", "graças a quem", "com que", "a quem"
 * (never the *quê* that only closes a clause). A plain direction or source is *aonde* / *de onde*, a
 * time *quando* or *até quando* (`questionAdverbial`); the negative cause is "por culpa de quem".
 */
export function questionWord(question: ResolvedQuestion, verb: ConceptForms): string {
  // The possessor question's *de*-phrase, which fronts alone from the object (P09-E14).
  if (question.role === 'possessor') return 'de quem';
  // A passive's agent asked about is the by-phrase over the stand-in (P09-E16): *por quem*, and *por que coisa* for a thing, since *por que* is *why*.
  if (question.role === 'agent') return agentPhrase(questionStandIn(question, { base: question.animate ? 'quem' : 'que coisa' })).replace(/\s+/g, ' ').trim();
  const adverb = questionAdverbial(question);
  if (adverb) return ADVERBIAL[adverb];
  const gap = questionGapComplement(question, { base: question.animate ? 'quem' : 'que' });
  // The route's *por* over *que* would be the *why* of "por que?", so a place gone through is asked
  // *por onde*, as Portuguese asks it anyway (P09-E15).
  const text = gap ? complementsPhrase(gap, {}, verb.conceptId).replace(/\s+/g, ' ').trim() : '';
  if (gap) return text === 'por que' ? 'por onde' : text;
  const prep = question.role === 'directObject' ? objectPreposition(verb) : '';
  if (question.animate) return prep ? `${prep} quem` : 'quem';
  return prep ? `${prep} que` : 'o que';
}
