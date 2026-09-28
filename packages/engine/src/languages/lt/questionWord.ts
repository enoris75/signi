import type { ConceptForms, ResolvedQuestion } from '../../types.js';
import { questionAdverbial } from '../../functions/questionAdverbial.js';
import { questionGapComplement, questionStandIn } from '../../functions/questionGapComplement.js';
import { AGENT, KAS, QUESTION_ADVERBS, WHOSE } from './lt.consts.js';
import { complementsPhrase } from './complementsPhrase.js';
import { elementText } from './elementText.js';
import { objectGovernment } from './objectGovernment.js';
import { withPreposition } from './withPreposition.js';

/**
 * The fronted wh-word of a question (P09-E6): *kas* declined for the gap's case, who and what alike —
 * the object's genitive under negation too (*ko katė nevalgo?*), a prepositional object's preposition
 * (*apie ką galvoja?*) — the adverbs *kur, kaip, kodėl, iš kur, kada, iki kada*, and a complement gap
 * through the complement path, adposition and case kept (*po kuo*, *su kuo*, *kieno dėka*: verify). A
 * possessor gap is *kieno*, written inside its noun phrase (`nounPhrase`), and has no word here.
 */
export function questionWord(question: ResolvedQuestion, verb: ConceptForms, negated: boolean): string {
  if (question.role === 'possessor') return '';
  if (question.role === 'subject') return KAS.nom;
  // The agent is a genitive of a person, which the question asks with *kieno* (*kieno suvalgyta pelė?*).
  if (question.role === 'agent') return question.animate ? WHOSE : withPreposition(AGENT, elementText(questionStandIn(question, {}), AGENT.case));
  const adverb = questionAdverbial(question);
  if (adverb) return QUESTION_ADVERBS[adverb];
  const gap = questionGapComplement(question, {}, verb.forms);
  if (gap) return complementsPhrase(gap, { subject: {}, verb: verb.forms });
  const gov = objectGovernment(verb.forms, negated);
  return withPreposition(gov.prep, KAS[gov.case === 'voc' ? 'nom' : gov.case]);
}
