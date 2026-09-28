import type { ConceptForms, ResolvedQuestion } from '../../types.js';
import { questionAdverbial } from '../../functions/questionAdverbial.js';
import { questionGapComplement, questionStandIn } from '../../functions/questionGapComplement.js';
import { AGENT, CO, KTO, QUESTION_ADVERBS } from './pl.consts.js';
import { complementsPhrase } from './complementsPhrase.js';
import { elementText } from './elementText.js';
import { objectGovernment } from './objectGovernment.js';
import { withPreposition } from './withPreposition.js';

/**
 * The fronted wh-word of a question (P09-E6): *kto / co* declined for the gap's case — the object's
 * genitive under negation too (*czego kot nie je?*), a prepositional object's preposition (*na kogo
 * czeka?*) — the adverbs *gdzie, jak, dlaczego, dokąd, skąd, kiedy, do kiedy*, and a complement gap
 * through the complement path, preposition and case kept (*pod czym*, *z kim*, *dzięki komu*). A
 * possessor gap is *czyj*, written inside its noun phrase (`nounPhrase`), and has no word here.
 */
export function questionWord(question: ResolvedQuestion, verb: ConceptForms, negated: boolean): string {
  if (question.role === 'possessor') return '';
  const table = question.animate ? KTO : CO;
  if (question.role === 'subject') return table.nom;
  if (question.role === 'agent') return withPreposition(AGENT.prep, elementText(questionStandIn(question, {}), AGENT.case));
  const adverb = questionAdverbial(question);
  if (adverb) return QUESTION_ADVERBS[adverb];
  const gap = questionGapComplement(question, {}, verb.forms);
  if (gap) return complementsPhrase(gap, { subject: {}, verb: verb.forms });
  const gov = objectGovernment(verb.forms, negated);
  return withPreposition(gov.prep, table[gov.case === 'voc' ? 'nom' : gov.case]);
}
