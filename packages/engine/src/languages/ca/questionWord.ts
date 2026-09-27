import type { ConceptForms, ResolvedQuestion } from '../../types.js';
import { type QuestionAdverb, questionAdverbial } from '../../functions/questionAdverbial.js';
import { questionGapComplement, questionStandIn } from '../../functions/questionGapComplement.js';
import { agentPhrase } from './agentPhrase.js';
import { caSurface } from './caSurface.js';
import { complementsPhrase } from './complementsPhrase.js';
import { objectPreposition } from '../../functions/objectPreposition.js';

const ADVERBIAL: Record<QuestionAdverb, string> = { where: 'on', how: 'com', why: 'per què', whereTo: 'on', whereFrom: "d'on", when: 'quan', untilWhen: 'fins quan' };

/**
 * The Catalan wh-word for a question's gap (P09-E6): *qui* for a person and *què* for a thing, and
 * *on*, *com*, *per què*, *quan* over the adverbial gaps. Catalan has no personal *a* before a noun,
 * but a person asked about as the object is *a qui*, which keeps it apart from the subject's *qui*;
 * a verb that takes its object with a preposition asks with it: "de què depèn el gat?".
 *
 * A complement gap keeps its relation (P09-E15), rendered through the complement path: "sota què",
 * "gràcies a qui", "amb què", "a qui". A plain direction is *on* ("on va el gat?"), a source *d'on*.
 */
export function questionWord(question: ResolvedQuestion, verb: ConceptForms): string {
  if (question.role === 'possessor') return 'de qui';
  // A passive's agent asked about is the by-phrase over the stand-in (P09-E16): *per qui*, and *per
  // quina cosa* for a thing, since *per què* is *why*.
  if (question.role === 'agent') return agentPhrase(questionStandIn(question, { base: question.animate ? 'qui' : 'quina cosa' })).replace(/\s+/g, ' ').trim();
  const adverb = questionAdverbial(question);
  if (adverb) return ADVERBIAL[adverb];
  const gap = questionGapComplement(question, { base: question.animate ? 'qui' : 'què' }, verb.forms);
  const text = gap ? caSurface(complementsPhrase(gap, {}, verb.conceptId).replace(/\s+/g, ' ').trim()) : '';
  // The route's *per* over *què* would be the *why*, so a place gone through is asked *per on*; over a
  // person it is *a través de qui* (A374).
  if (gap) return text === 'per què' ? 'per on' : text === 'per qui' && question.role === 'route' ? 'a través de qui' : text;
  const word = question.animate ? 'qui' : 'què';
  if (question.role === 'subject') return word;
  // A person asked about as the object takes *a*, as the IEC admits for *qui* to keep it apart from
  // the subject's question: "a qui veu el gat?" against "qui veu el gat?" (verify).
  const prep = objectPreposition(verb) || (question.animate ? 'a' : '');
  return prep ? caSurface(`${prep} ${word}`) : word;
}
