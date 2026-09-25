import { isPronominalPossessor } from '@signi/shared';
import { isQuestionPossessor } from '../../functions/questionPossessor.js';
import type { ResolvedNounPhrase } from '../../types.js';
import { possessedHeadForms } from '../../functions/possessedHeadForms.js';
import { dativePronounGsw, keptBesidePossessive, possessiveGsw } from '../../possessive.js';
import type { Case } from './gsw.types.js';
import { adjectivalNoun } from './adjectivalNoun.js';
import { adjPhrase } from './adjPhrase.js';
import { articledNameForms } from './articledNameForms.js';
import { cardinalOne } from './cardinalOne.js';
import { datPluralN } from './datPluralN.js';
import { determiner } from './determiner.js';
import { germanCompound } from './germanCompound.js';
import { modifierGenitives } from './modifierGenitives.js';
import { nounExamples } from './nounExamples.js';
import { numeralDe } from './numeralDe.js';
import { nounStandard } from './nounStandard.js';
import { possessorDative, possessorText, questionPossessorWord, withPossessorDative } from './possessorText.js';
import { possessedDeclension } from './possessedDeclension.js';
import { postnominal } from './postnominal.js';
import { subordinateClause } from './subordinateClause.js';
import { weakN } from './weakN.js';

export function nounPhrase(counted: ResolvedNounPhrase, _case: Case): string {
  // A bare phrase counted by one is the indefinite one, its ein-word declined (A321).
  // A definite owner that is a person or an animal stands in front as a possessor dative (P10-E12).
  const np = withPossessorDative(cardinalOne(counted));
  const forms = np.head.forms;
  const count = forms['number'] ?? forms['count'] ?? 'singular';
  const plural = count === 'plural';
  const headWord = plural ? (forms['plural'] ?? forms['base'] ?? '') : (forms['base'] ?? '');
  const compound = germanCompound(np, headWord);
  // The determiner the head and its adjectives alike decline after — a possessive is an ein-word, so
  // a possessed phrase declines as "kein" (see `possessedDeclension`).
  const declension = possessedDeclension(np, forms);
  // "die meisten" takes a possessed head as its partitive genitive, "die meisten ihrer Kater", so the
  // possessive, the adjectives and the noun are genitive whatever case the determiner is (A314).
  const mostOfPossessed = forms['definiteness'] === 'most' && forms['proper'] !== '1'
    && !!np.possessor && isPronominalPossessor(np.possessor);
  const nounCase: Case = mostOfPossessed ? 'gen' : _case;
  // An adjectival noun takes the adjective ending its determiner and case select and none of the
  // noun rules below: "ein Verwandter", "meinem Verwandten", "des Verwandten" (P11 D8).
  // Otherwise the genitive is `genitiveS`'s: -(e)s on a masculine/neuter, -(e)n on a weak masculine,
  // or the form the lexicon records ("Namens"). Elsewhere a weak masculine declines to -(e)n in the
  // oblique singular, and every other noun takes the regular dative-plural -n.
  const word = forms['adjectival'] === '1'
    ? adjectivalNoun(compound, forms, nounCase, declension, plural)
    : forms['weak'] === '1' ? weakN(compound, nounCase, plural) : datPluralN(compound, nounCase, plural);
  // A pronominal possessor ("sein Hund") is a prenominal ein-word possessive replacing the
  // article, declined for this possessed head's case/gender/number. Following adjectives then
  // decline as they do after "kein" (`possessedDeclension`): "sein großer Hund", "seine großen Hunde".
  //
  // A head that carries a determiner of its own keeps it, and the possessor moves into a
  // postnominal "von" + dative phrase: "dieses Buch von ihr", "kein Buch von ihr" (A187). The
  // adjectives then decline after that determiner, not after the possessive. After "all" the
  // possessive stays prenominal, with "alle" in front of it: "alle ihre Bücher".
  const poss = np.possessor;
  const pronominal = poss && isPronominalPossessor(poss) ? poss : undefined;
  const detached = !!pronominal && keptBesidePossessive(forms);
  const declined = adjPhrase(np, nounCase, declension);
  const a = declined ? `${declined} ` : '';
  const possessive = pronominal
    ? possessiveGsw(pronominal, nounCase, { gender: (forms['gender'] ?? 'neut') as 'masc' | 'fem' | 'neut', number: plural ? 'plural' : 'singular' })
    : '';
  // The head's own determiner, from forms that have dropped `proper` the way `possessedHeadForms`
  // drops it for a possessed name ("diese Asien von ihr").
  const ownForms = { ...possessedHeadForms(np, 'bare'), definiteness: forms['definiteness'] ?? 'definite' };
  // der/die/das · ein/eine/einen · (bare) · das große Asien
  // A possessor question's stand-in is *wessen* in the determiner's place, the noun article-less:
  // "wessen Essen", "wessen Bücher" (P09-E14).
  const dativeOwner = possessorDative(np, nounCase);
  const art = isQuestionPossessor(poss) ? questionPossessorWord(forms, nounCase)
    : dativeOwner ? dativeOwner
    : !pronominal || detached ? determiner(articledNameForms(np, pronominal ? ownForms : undefined), _case, plural)
    : forms['definiteness'] === 'all' || mostOfPossessed ? `${determiner(ownForms, _case, plural)} ${possessive}`
    : possessive;
  // A cardinal stands between the determiner and the declined adjectives: "die zwei großen Häuser"
  // (C31). It declines only at one, where it is the indefinite article's own word: bare, the article
  // builder has already written that (`cardinalOne`), and after der or dieser it declines weak, "der
  // eine Hund" (`numeralDe`, A319), after a possessive mixed, "ihr einer Freund" (A357). From two up German's cardinals are invariable.
  const numeral = numeralDe(forms, nounCase, declension, isQuestionPossessor(poss), !!pronominal);
  const lead = [art, numeral].filter(Boolean).map((w) => `${w} `).join('');
  const vonPhrase = detached && pronominal ? ` vo ${dativePronounGsw(pronominal)}` : '';
  return `${lead}${a}${word}${postnominal(forms)}${modifierGenitives(np)}${vonPhrase}${possessorText(np)}${nounStandard(np, _case)}${subordinateClause(np)}${nounExamples(np, _case)}`;
}
