import type { ConceptForms, ResolvedQuestion } from '../../types.js';
import { type QuestionAdverb, questionAdverbial } from '../../functions/questionAdverbial.js';
import { questionGapComplement, questionStandIn } from '../../functions/questionGapComplement.js';
import { agentPhrase } from './agentPhrase.js';
import { complementsPhrase } from './complementsPhrase.js';
import { objectPreposition } from '../../functions/objectPreposition.js';

const ADVERBIAL: Record<QuestionAdverb, string> = { where: 'dove', how: 'come', why: 'perché', whereTo: 'dove', whereFrom: 'da dove', when: 'quando', untilWhen: 'fino a quando' };

/**
 * The Italian wh-word for a question's gap (P09-E6): *chi* for a person and *che cosa* for a thing,
 * over the subject and the object alike, and *dove*, *come*, *perché* over the adverbial gaps. *che
 * cosa* is the full form of the three Italian uses (*che*, *cosa*), the one no register objects to.
 * A verb that takes its object with a preposition asks with it: "a che cosa pensa il gatto?".
 *
 * A complement gap keeps its relation (P09-E15): the word is *chi* / *che cosa* rendered through the
 * complement path, preposition and all, as the relativizer's *quale* is — "sotto che cosa", "grazie a
 * chi", "con che cosa", "a chi". A plain direction or source is *dove* / *da dove*, a time *quando* or
 * *fino a quando* (`questionAdverbial`); the negative cause is "per colpa di chi".
 */
export function questionWord(question: ResolvedQuestion, verb: ConceptForms): string {
  // The possessor question's *de*-phrase, which fronts alone from the object (P09-E14).
  if (question.role === 'possessor') return 'di chi';
  // A passive's agent asked about is the by-phrase over the stand-in (P09-E16): *da chi* / *da che cosa*.
  if (question.role === 'agent') return agentPhrase(questionStandIn(question, { base: question.animate ? 'chi' : 'che cosa' })).replace(/\s+/g, ' ').trim();
  const adverb = questionAdverbial(question);
  if (adverb) return ADVERBIAL[adverb];
  const gap = gapText(question, verb);
  if (gap) return gap.replace(SOURCE_PARTICLE, '');
  const word = question.animate ? 'chi' : 'che cosa';
  const prep = question.role === 'directObject' ? objectPreposition(verb) : '';
  return prep ? `${prep} ${word}` : word;
}

// The ablative particle a source takes under a self-propelled motion verb, or over a person under a
// verb that takes a goal (see `complementsPhrase`): "corre via dalla casa", "viene via dalla donna".
const SOURCE_PARTICLE = /^via /;

function gapText(question: ResolvedQuestion, verb: ConceptForms): string {
  const gap = questionGapComplement(question, { base: question.animate ? 'chi' : 'che cosa' });
  return gap ? complementsPhrase(gap, {}, verb.conceptId, {}, verb.forms).replace(/\s+/g, ' ').trim() : '';
}

/**
 * The particle a question's gap leaves behind the verb (A276): the ablative *via* of a source,
 * which belongs to the verb (*venire via*, *correre via*), so the fronted *da*-phrase goes without it
 * and the particle stays where the statement writes it: "da chi viene via il gatto?". Empty for any
 * other gap, and for the adverb *da dove*, which takes none.
 */
export function questionParticle(question: ResolvedQuestion, verb: ConceptForms): string {
  if (question.role !== 'source' || questionAdverbial(question)) return '';
  return SOURCE_PARTICLE.test(gapText(question, verb)) ? 'via' : '';
}
