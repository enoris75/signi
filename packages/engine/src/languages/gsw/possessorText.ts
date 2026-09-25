import { isPronominalPossessor } from '@signi/shared';
import { isQuestionPossessor } from '../../functions/questionPossessor.js';
import type { ResolvedNounPhrase } from '../../types.js';
import { dativePronounGsw, keptBesidePossessive, possessiveGsw } from '../../possessive.js';
import type { Case } from './gsw.types.js';
import { adjPhrase } from './adjPhrase.js';
import { adjectivalNoun } from './adjectivalNoun.js';
import { articledNameForms } from './articledNameForms.js';
import { cardinalOne } from './cardinalOne.js';
import { numeralText } from '../../functions/numeralText.js';
import { CARDINALS } from './gsw.consts.js';
import { determiner } from './determiner.js';
import { germanCompound } from './germanCompound.js';
import { modifierGenitives } from './modifierGenitives.js';
import { nounExamples } from './nounExamples.js';
import { nounStandard } from './nounStandard.js';
import { nounPhrase } from './nounPhrase.js';
import { postnominal } from './postnominal.js';
import { subordinateClause } from './subordinateClause.js';

/**
 * Possession without a genitive (P10 D7, E12). Swiss German names an owner two ways:
 *
 * - **the possessor dative**, before the possessed noun, for a definite owner that is a person or an
 *   animal (E12 D1): the owner in the dative, then a possessive agreeing with the owner in person,
 *   number and gender and with the possessed noun in gender, number and case (E12 D2) — "**em Vatter
 *   sis** Huus", "**de Mueter ires** Huus", "**de Chatze ires** Fuetter", "mit **em Vatter sim** Hund".
 *   It takes the determiner's place.
 * - **vo + the dative**, after it, for every other owner: "s Huus **vom Vatter**" is not said here, but
 *   "s Dach **vom Huus**", "s Huus **vo emene Maa**".
 *
 * An owner that has an owner of its own takes the possessor dative for the outermost link only, and
 * *vo* for the inner ones (E12 D3): "em Maa sis Huus vo de Mueter" rather than the heavy "de Mueter
 * irem Maa sis Huus". Both rulings are the reviewer's to widen or narrow (E14).
 */

/** Marks a head whose possessor stands before it as a possessor dative, its determiner given up. */
const DATIVE_MARK = 'possessor_dative';
/** Marks an owner rendered inside a possessor dative, whose own owner follows with *vo* (E12 D3). */
const INNER_MARK = 'possessor_inner';

function ownerIsPersonOrAnimal(forms: Record<string, string>): boolean {
  return forms['animate'] === '1' || forms['human'] === '1' || forms['animal'] === '1';
}

function ownerIsDefinite(owner: ResolvedNounPhrase): boolean {
  const f = owner.head.forms;
  const definiteness = f['definiteness'] ?? 'definite';
  return f['proper'] === '1' || definiteness === 'definite' || definiteness === 'this' || definiteness === 'that'
    || (!!owner.possessor && isPronominalPossessor(owner.possessor) && !keptBesidePossessive(f));
}

/**
 * The phrase with its possessor moved in front of it as a possessor dative, where the owner takes one
 * (see above): the head's determiner becomes bare, since the dative and its possessive stand in its
 * place, and the head is marked so the phrase builders write `possessorDative` there. Any other phrase
 * is returned as it is.
 */
export function withPossessorDative(np: ResolvedNounPhrase): ResolvedNounPhrase {
  const owner = np.possessor;
  if (!owner || isPronominalPossessor(owner) || isQuestionPossessor(owner)) return np;
  const f = np.head.forms;
  if (f[DATIVE_MARK] === '1' || f[INNER_MARK] === '1') return np;
  const ownerNp = owner as ResolvedNounPhrase;
  if (!ownerIsDefinite(ownerNp) || !ownerIsPersonOrAnimal(ownerNp.head.forms)) return np;
  return { ...np, head: { ...np.head, forms: { ...f, definiteness: 'bare', [DATIVE_MARK]: '1' } } };
}

/** Whether `withPossessorDative` moved this phrase's possessor in front of it. */
export function hasPossessorDative(np: ResolvedNounPhrase): boolean {
  return np.head.forms[DATIVE_MARK] === '1';
}

/**
 * The possessive of a third-person owner, agreeing with the possessed head (E12 D2): *sis, sini, sin*
 * (masculine or neuter owner), *ires, iri, ire* (feminine or plural owner), in the possessed head's
 * case — "sim Huus", "irere Chatz".
 */
export function ownerPossessive(owner: Record<string, string>, possessed: Record<string, string>, _case: Case): string {
  const ownerPlural = (owner['number'] ?? owner['count']) === 'plural';
  const possessedPlural = (possessed['number'] ?? possessed['count']) === 'plural';
  return possessiveGsw(
    { kind: 'pronominal', person: '3', number: ownerPlural ? 'plural' : 'singular', gender: (owner['gender'] ?? 'neut') as 'masc' | 'fem' | 'neut' },
    _case,
    { gender: (possessed['gender'] ?? 'neut') as 'masc' | 'fem' | 'neut', number: possessedPlural ? 'plural' : 'singular' },
  );
}

/** The possessor dative in the determiner's place: "em Vatter sis", "mim Vatter sim" (see above). */
export function possessorDative(np: ResolvedNounPhrase, _case: Case): string {
  if (!hasPossessorDative(np)) return '';
  const owner = np.possessor as ResolvedNounPhrase;
  const inner = { ...owner, head: { ...owner.head, forms: { ...owner.head.forms, [INNER_MARK]: '1' } } };
  return [nounPhrase(inner, 'dat'), ownerPossessive(owner.head.forms, np.head.forms, _case)].filter(Boolean).join(' ');
}

/** The possessor question's word in the determiner's place: *wem sis* (E12, "wem sis Huus?"). */
export function questionPossessorWord(possessed: Record<string, string>, _case: Case): string {
  return `wem ${ownerPossessive({ gender: 'masc' }, possessed, _case)}`;
}

/**
 * The possessor after the possessed noun: *vo* + the dative, for an owner that takes no possessor
 * dative. Empty for a pronominal possessor (a prenominal *mis*), a possessor question (*wem sis*), and
 * a possessor dative, all of which stand in front.
 */
export function possessorText(np: ResolvedNounPhrase): string {
  const poss = np.possessor;
  if (!poss || isPronominalPossessor(poss) || isQuestionPossessor(poss) || hasPossessorDative(np)) return '';
  // A possessor counted by one is the indefinite one: "vo emene Hund" (A321).
  const counted = cardinalOne(poss);
  return ` ${voDative(counted)}`;
}

// The possessor's own pronominal possessive, when it detached beside a kept determiner, as
// `nounPhrase` writes it: "s Huus vo Fründe vo mir" (A326).
function detachedVo(poss: ResolvedNounPhrase): string {
  const own = poss.possessor;
  return own && isPronominalPossessor(own) && keptBesidePossessive(poss.head.forms) ? ` vo ${dativePronounGsw(own)}` : '';
}

// *vo* + the dative, fused with the article where Zürich fuses it: "vom Huus", "vo de Mueter".
function voDative(poss: ResolvedNounPhrase): string {
  const inner = poss.possessor && !isPronominalPossessor(poss.possessor) && !isQuestionPossessor(poss.possessor)
    ? withPossessorDative(poss) : poss;
  if (hasPossessorDative(inner)) return `vo ${nounPhrase(inner, 'dat')}`;
  const f = articledNameForms(poss);
  const plural = (f['number'] ?? f['count']) === 'plural';
  const compound = germanCompound(poss, plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? ''));
  const definiteness = f['definiteness'] ?? 'definite';
  const word = f['adjectival'] === '1' ? adjectivalNoun(compound, f, 'dat', definiteness, plural) : compound;
  const det = determiner(f, 'dat', plural);
  const words = [
    det === 'em' ? 'vom' : ['vo', det].filter(Boolean).join(' '),
    // A counted possessor keeps its cardinal: "en Ziitruum vo vierezwänzg Stunde" (C31).
    numeralText(f, CARDINALS),
    adjPhrase(poss, 'dat', definiteness),
    `${word}${postnominal(f)}${modifierGenitives(poss)}${detachedVo(poss)}${possessorText(poss)}${nounStandard(poss, 'dat')}${subordinateClause(poss)}${nounExamples(poss, 'dat')}`,
  ];
  return words.filter(Boolean).join(' ');
}
