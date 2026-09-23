import type { ConceptForms, ResolvedQuestion } from '../../types.js';
import { type QuestionAdverb, questionAdverbial } from '../../functions/questionAdverbial.js';
import { questionGapComplement, questionStandIn } from '../../functions/questionGapComplement.js';
import { agentPhrase } from './agentPhrase.js';
import { complementsPhrase } from './complementsPhrase.js';
import { objectPreposition } from '../../functions/objectPreposition.js';

const ADVERBIAL: Record<QuestionAdverb, string> = { where: 'où', how: 'comment', why: 'pourquoi', whereTo: 'où', whereFrom: "d'où", when: 'quand', untilWhen: "jusqu'à quand" };

/**
 * The French wh-word for a question's gap (P09-E6). Over the subject it is the whole subject: *qui*
 * for a person, and for a thing *qu'est-ce qui*, since the bare *que* cannot be a subject ("qu'est-ce
 * qui mange la nourriture ?"). Over the object it is *qui* or *que*, the word `frontQuestion` sets
 * before "est-ce que" ("qu'est-ce que le chat mange ?"); after a preposition *que* takes its tonic
 * form *quoi* ("à quoi est-ce qu'il pense ?"). The adverbial gaps are *où*, *comment*, *pourquoi*.
 *
 * A complement gap keeps its relation (P09-E15): the word is *qui* / the tonic *quoi* rendered
 * through the complement path, preposition and all — "sous quoi", "grâce à qui", "avec quoi", "à
 * qui". A plain direction or source is *où* / *d'où*, a time *quand* or *jusqu'à quand*
 * (`questionAdverbial`); the negative cause is "par la faute de qui".
 */
export function questionWord(question: ResolvedQuestion, verb: ConceptForms): string {
  if (question.role === 'subject') return question.animate ? 'qui' : "qu'est-ce qui";
  // The possessor question's *de*-phrase, which fronts alone from the object — *de qui*, never the
  // relative *dont* (P09-E14).
  if (question.role === 'possessor') return 'de qui';
  // A passive's agent asked about is the by-phrase over the stand-in (P09-E16): *par qui* / *par quoi*.
  if (question.role === 'agent') return agentPhrase(questionStandIn(question, { base: question.animate ? 'qui' : 'quoi' })).replace(/\s+/g, ' ').trim();
  const adverb = questionAdverbial(question);
  if (adverb) return ADVERBIAL[adverb];
  const gap = questionGapComplement(question, { base: question.animate ? 'qui' : 'quoi' });
  if (gap) return complementsPhrase(gap, {}, verb.conceptId, {}, verb.forms).replace(/\s+/g, ' ').trim();
  const prep = objectPreposition(verb);
  const word = question.animate ? 'qui' : prep ? 'quoi' : 'que';
  return prep ? `${prep} ${word}` : word;
}
