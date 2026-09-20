import type { ResolvedNounElement } from '../../types.js';
import { coordinate } from './coordinate.js';
import { itPossessedHeadForms } from './itPossessedHeadForms.js';
import { prepDet } from './prepDet.js';
import { renderNP } from './renderNP.js';

/**
 * The by-phrase of a passive clause — the demoted agent under "da" ("è mangiato **dal gatto**").
 * The preposition fuses with a definite article, so it cannot be factored out in front of a
 * coordinated agent: each conjunct carries its own head ("dal gatto e dal cane"), exactly as an
 * adposition-bearing complement does. A pronoun takes its tonic form after the bare preposition
 * ("da me"), never the article path that would give "dall'io".
 *
 * Empty when there is no agent to speak — an active clause, or the agentless passive, whose generic
 * agent the translator drops rather than passing here (see ResolvedPhrase.agent).
 */
export function agentPhrase(agent?: ResolvedNounElement): string {
  if (!agent) return '';
  return coordinate(agent, (np) =>
    np.head.forms['person']
      ? `da ${np.head.forms['disjunctive'] ?? np.head.forms['base'] ?? ''}`
      : renderNP(np, (plural, lead) => prepDet('da', itPossessedHeadForms(np), plural, lead)));
}
