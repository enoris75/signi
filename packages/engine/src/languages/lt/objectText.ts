import type { ResolvedNounElement } from '../../types.js';
import { elementText } from './elementText.js';
import { objectGovernment } from './objectGovernment.js';
import { withPreposition } from './withPreposition.js';

/**
 * The direct object in the case its verb governs (`objectGovernment`): the accusative, the genitive
 * under *ne-*, the lexeme's own case or preposition (*galvoja apie pelę*). Lithuanian has no clitic,
 * so a pronoun object is its full form in its place (*mato jį*). `subject` is the clause's, for *savo*.
 */
export function objectText(object: ResolvedNounElement, verb: Record<string, string>, negated: boolean, subject: Record<string, string>): string {
  const gov = objectGovernment(verb, negated);
  return withPreposition(gov.prep, elementText(object, gov.case, { subject }));
}
