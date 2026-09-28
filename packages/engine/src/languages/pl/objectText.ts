import type { ResolvedNounElement } from '../../types.js';
import { elementText } from './elementText.js';
import { objectGovernment } from './objectGovernment.js';
import { withPreposition } from './withPreposition.js';

/**
 * The direct object in the case its verb governs (`objectGovernment`): the accusative, the genitive
 * under *nie*, the lexeme's own case or preposition (*czeka na mysz*). A personal pronoun takes its
 * clitic where it has one (*widzi go*, *pomaga mu*), its *n*-form after a preposition (*czeka na
 * niego*). `subject` is the clause's, for *swój*.
 */
export function objectText(object: ResolvedNounElement, verb: Record<string, string>, negated: boolean, subject: Record<string, string>): string {
  const gov = objectGovernment(verb, negated);
  return withPreposition(gov.prep, elementText(object, gov.case, { subject, afterPrep: gov.prep !== '', short: gov.prep === '' }));
}
