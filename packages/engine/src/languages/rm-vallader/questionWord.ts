import type { ConceptForms, ResolvedQuestion } from '../../types.js';
import { type QuestionAdverb, questionAdverbial } from '../../functions/questionAdverbial.js';
import { questionGapComplement, questionStandIn } from '../../functions/questionGapComplement.js';
import { agentPhrase } from './agentPhrase.js';
import { complementsPhrase } from './complementsPhrase.js';
import { objectPreposition } from '../../functions/objectPreposition.js';

// The adverbial wh-words (the author's draft, verify): *ingio* (where, and where to), *da ingio*
// (where from), *co* (how), *perche* (why), *cur* (when), *fin cur* (until when).
const ADVERBIAL: Record<QuestionAdverb, string> = { where: 'ingio', how: 'co', why: 'perche', whereTo: 'ingio', whereFrom: 'da ingio', when: 'cur', untilWhen: 'fin cur' };

/** *chi* for a person, *che* for a thing (verify). */
const who = (question: ResolvedQuestion): string => (question.animate ? 'chi' : 'che');

/**
 * The wh-word for a question's gap (P09-E6): *chi* for a person and *che* for a thing, over the
 * subject and the object alike, and the adverbs above over the adverbial gaps. A verb that takes its
 * object with a preposition asks with it: "a che crajast?". A complement gap keeps its relation
 * (P09-E15), rendered through the complement path: "suot che", "cun chi", "a chi".
 */
export function questionWord(question: ResolvedQuestion, verb: ConceptForms): string {
  // The possessor question's *da*-phrase, which fronts alone from the object (P09-E14).
  if (question.role === 'possessor') return 'da chi';
  // A passive's agent asked about is the by-phrase over the stand-in (P09-E16): *da chi*.
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
