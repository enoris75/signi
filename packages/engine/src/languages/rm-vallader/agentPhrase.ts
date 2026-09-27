import type { ResolvedNounElement } from '../../types.js';
import { coordinate } from './coordinate.js';
import { vlPossessedHeadForms } from './vlPossessedHeadForms.js';
import { prepDet } from './prepDet.js';
import { renderNP } from './renderNP.js';
import { withRelative } from './withRelative.js';

/**
 * The by-phrase of a passive clause — the demoted agent under *da* ("la mür vain mangiada **dal
 * giat**"), contracting with each conjunct's masculine article ("dal giat e dal chan"). A pronoun takes
 * its tonic form ("da mai"). Empty when there is no agent to speak.
 */
export function agentPhrase(agent?: ResolvedNounElement): string {
  if (!agent) return '';
  return coordinate(agent, (np) =>
    np.head.forms['person']
      ? withRelative(`da ${np.head.forms['disjunctive'] ?? np.head.forms['base'] ?? ''}`, np)
      : renderNP(np, (plural, lead) => prepDet('da', vlPossessedHeadForms(np), plural, lead)));
}
