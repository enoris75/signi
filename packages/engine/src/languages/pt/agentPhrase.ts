import type { ResolvedNounElement, ResolvedNounPhrase } from '../../types.js';
import { possessedHeadForms } from '../../functions/possessedHeadForms.js';
import { contractDet } from './contractDet.js';
import { coordinateElement } from './coordinateElement.js';
import { isPlural } from './isPlural.js';
import { porPrep } from './porPrep.js';
import { ptAdj } from './ptAdj.js';
import { ptPossessiveWord } from './ptPossessiveWord.js';
import { withAdj } from './withAdj.js';
import { withRelative } from './withRelative.js';

/**
 * The by-phrase of a passive clause — the demoted agent under "por" ("é comida **pelo gato**").
 * "por" contracts with the definite article (pelo / pela / pelos / pelas), so, like every other
 * contracting adposition here, it cannot be factored out in front of a coordinated agent: each
 * conjunct brings its own head ("pelo gato e pelo cão"). Any other determiner rides after the plain
 * preposition ("por um gato"), which `contractDet` decides.
 *
 * A pronoun takes its tonic form after the plain preposition: "por mim", "por ele". Unlike "de",
 * "por" fuses with no pronoun, so there is nothing to contract there.
 *
 * Empty when there is no agent to speak — an active clause, or the agentless passive, whose generic
 * agent the translator drops rather than passing here (see ResolvedPhrase.agent).
 */
export function agentPhrase(agent?: ResolvedNounElement): string {
  if (!agent) return '';
  return coordinateElement(agent, (np) =>
    np.head.forms['person'] ? withRelative(`por ${np.head.forms['disjunctive'] ?? np.head.forms['base'] ?? ''}`, np) : nounAgent(np));
}

function nounAgent(np: ResolvedNounPhrase): string {
  // A possessive rides on the definite article, which the preposition fuses with ("pela minha gata").
  const forms = possessedHeadForms(np, 'definite');
  const plural = isPlural(forms);
  const word = plural ? (forms['plural'] ?? forms['base'] ?? '') : (forms['base'] ?? '');
  const noun = [ptPossessiveWord(np, false), withAdj(word, ptAdj(np))].filter(Boolean).join(' ');
  return withRelative(`${contractDet(porPrep, 'por', forms, plural)} ${noun}`, np);
}
