import type { ConceptForms, ResolvedQuestion } from '../../types.js';
import { type QuestionAdverb, questionAdverbial } from '../../functions/questionAdverbial.js';
import { questionGapComplement, questionStandIn } from '../../functions/questionGapComplement.js';
import { agentPhrase } from './agentPhrase.js';
import { complementsPhrase } from './complementsPhrase.js';
import { objectPreposition } from '../../functions/objectPreposition.js';

// The adverbial wh-words (verify): *nua* (where, and where to), *danunder* (where from), *co* (how),
// *pertgei* (why), *cura* (when), *fin cura* (until when).
const ADVERBIAL: Record<QuestionAdverb, string> = { where: 'nua', how: 'co', why: 'pertgei', whereTo: 'nua', whereFrom: 'danunder', when: 'cura', untilWhen: 'tochen cura' };

/** *tgi* for a person, *tgei* for a thing. */
const who = (question: ResolvedQuestion): string => (question.animate ? 'tgi' : 'tgei');

/**
 * The wh-word for a question's gap (P09-E6): *tgi* for a person and *tgei* for a thing, over the
 * subject and the object alike, and the adverbs above over the adverbial gaps. A verb that takes its
 * object with a preposition asks with it: "vi da tgei patratga il gat?". A complement gap keeps its
 * relation (P09-E15), rendered through the complement path: "sut tgei", "cun tgi", "a tgi".
 */
export function questionWord(question: ResolvedQuestion, verb: ConceptForms): string {
  // The possessor question's *da*-phrase, which fronts alone from the object (P09-E14).
  if (question.role === 'possessor') return 'da tgi';
  // A passive's agent asked about is the by-phrase over the stand-in (P09-E16): *da tgi*.
  if (question.role === 'agent') return agentPhrase(questionStandIn(question, { base: who(question) })).replace(/\s+/g, ' ').trim();
  const adverb = questionAdverbial(question);
  if (adverb) return ADVERBIAL[adverb];
  const gap = gapText(question, verb);
  if (gap) return gap;
  const prep = question.role === 'directObject' ? objectPreposition(verb) : '';
  return prep ? `${prep} ${who(question)}` : who(question);
}

function gapText(question: ResolvedQuestion, verb: ConceptForms): string {
  const gap = questionGapComplement(question, { base: who(question) }, verb.forms);
  return gap ? complementsPhrase(gap, {}, verb.conceptId, {}, verb.forms).replace(/\s+/g, ' ').trim() : '';
}
