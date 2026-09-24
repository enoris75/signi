import { isPronominalPossessor } from '@signi/shared';
import type { ResolvedNounElement } from '../../types.js';
import { possessedHeadForms } from '../../functions/possessedHeadForms.js';
import { possessiveDe } from '../../possessive.js';
import { adjectivalNoun } from './adjectivalNoun.js';
import { adjPhrase } from './adjPhrase.js';
import { articledNameForms } from './articledNameForms.js';
import { coordinate } from './coordinate.js';
import { datPluralN } from './datPluralN.js';
import { germanCompound } from './germanCompound.js';
import { modifierGenitives } from './modifierGenitives.js';
import { possessedDeclension } from './possessedDeclension.js';
import { possessorText } from './possessorText.js';
import { nounExamples } from './nounExamples.js';
import { nounStandard } from './nounStandard.js';
import { postnominal } from './postnominal.js';
import { prepDet } from './prepDet.js';
import { subordinateClause } from './subordinateClause.js';
import { weakN } from './weakN.js';

/**
 * The by-phrase of a passive clause — the demoted agent under "von" + dative ("wird **von der
 * Katze** gegessen"). It is an ordinary prepositional phrase, built the way `complementsPhrase`
 * builds one: German spells the case on the determiner, so preposition and determiner are emitted
 * per conjunct and repeat across a coordination ("von der Katze und dem Hund"), and "von" fuses
 * with the dative masculine/neuter article ("vom Kater"), which `prepDet` decides.
 *
 * A pronoun takes the disjunctive (tonic) form every German preposition gives one, which is the
 * dative here: "von mir", "von ihm".
 *
 * Empty when there is no agent to speak — an active clause, or the agentless passive, whose generic
 * agent the translator drops rather than passing here (see ResolvedPhrase.agent).
 */
export function agentPhrase(agent?: ResolvedNounElement): string {
  if (!agent) return '';
  return coordinate(agent, (np) => {
    if (np.head.forms['person']) {
      return `von ${np.head.forms['disjunctive'] ?? np.head.forms['base'] ?? ''}`;
    }
    // A possessive is an ein-word in place of the article, so the head is the preposition alone and
    // the adjectives decline as they do after "kein" ("von meinem kleinen Kater", see
    // `possessedDeclension`).
    const poss = np.possessor && isPronominalPossessor(np.possessor) ? np.possessor : undefined;
    const f = articledNameForms(np, possessedHeadForms(np, 'bare'));
    const plural = (f['number'] ?? f['count']) === 'plural';
    const definiteness = possessedDeclension(np, f);
    const compound = germanCompound(np, plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? ''));
    const head = prepDet('von', f, 'dat', plural);
    // An adjectival noun takes the dative adjective ending instead ("von einem Verwandten", P11 D8);
    // a weak masculine declines to -(e)n in the oblique ("von dem Jungen"); every other noun takes
    // the regular dative-plural -n.
    const word = f['adjectival'] === '1'
      ? adjectivalNoun(compound, f, 'dat', definiteness, plural)
      : f['weak'] === '1' ? weakN(compound, 'dat', plural) : datPluralN(compound, 'dat', plural);
    const declined = adjPhrase(np, 'dat', definiteness);
    const adj = declined ? `${declined} ` : '';
    const possessive = poss
      ? `${possessiveDe(poss, 'dat', { gender: (f['gender'] ?? 'neut') as 'masc' | 'fem' | 'neut', number: plural ? 'plural' : 'singular' })} `
      : '';
    const rest = `${possessive}${adj}${word}${postnominal(f)}${modifierGenitives(np)}${possessorText(np)}${nounStandard(np, 'dat')}${subordinateClause(np)}${nounExamples(np, 'dat')}`;
    return head ? `${head} ${rest}` : rest;
  });
}
