import { isPronominalPossessor } from '@signi/shared';
import type { ResolvedNounPhrase } from '../../types.js';
import { possessedHeadForms } from '../../functions/possessedHeadForms.js';
import { dativePronounDe, KEPT_BESIDE_POSSESSIVE, possessiveDe } from '../../possessive.js';
import type { Case } from './de.types.js';
import { adjectivalNoun } from './adjectivalNoun.js';
import { adjPhrase } from './adjPhrase.js';
import { articledNameForms } from './articledNameForms.js';
import { datPluralN } from './datPluralN.js';
import { numeralText } from '../../functions/numeralText.js';
import { CARDINALS } from './de.consts.js';
import { determiner } from './determiner.js';
import { genitiveS } from './genitiveS.js';
import { germanCompound } from './germanCompound.js';
import { modifierGenitives } from './modifierGenitives.js';
import { nounStandard } from './nounStandard.js';
import { possessorText } from './possessorText.js';
import { possessedDeclension } from './possessedDeclension.js';
import { postnominal } from './postnominal.js';
import { subordinateClause } from './subordinateClause.js';
import { weakN } from './weakN.js';

export function nounPhrase(np: ResolvedNounPhrase, _case: Case): string {
  const forms = np.head.forms;
  const count = forms['number'] ?? forms['count'] ?? 'singular';
  const plural = count === 'plural';
  const headWord = plural ? (forms['plural'] ?? forms['base'] ?? '') : (forms['base'] ?? '');
  const compound = germanCompound(np, headWord);
  // The determiner the head and its adjectives alike decline after — a possessive is an ein-word, so
  // a possessed phrase declines as "kein" (see `possessedDeclension`).
  const declension = possessedDeclension(np, forms);
  // An adjectival noun takes the adjective ending its determiner and case select and none of the
  // noun rules below: "ein Verwandter", "meinem Verwandten", "des Verwandten" (P11 D8).
  // Otherwise the genitive is `genitiveS`'s: -(e)s on a masculine/neuter, -(e)n on a weak masculine,
  // or the form the lexicon records ("Namens"). Elsewhere a weak masculine declines to -(e)n in the
  // oblique singular, and every other noun takes the regular dative-plural -n.
  const word = forms['adjectival'] === '1'
    ? adjectivalNoun(compound, forms, _case, declension, plural)
    : _case === 'gen'
      ? genitiveS(compound, _case, forms, plural)
      : forms['weak'] === '1' ? weakN(compound, _case, plural) : datPluralN(compound, _case, plural);
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
  const detached = !!pronominal && KEPT_BESIDE_POSSESSIVE.has(forms['definiteness'] ?? 'definite');
  const declined = adjPhrase(np, _case, declension);
  const a = declined ? `${declined} ` : '';
  const possessive = pronominal
    ? possessiveDe(pronominal, _case, { gender: (forms['gender'] ?? 'neut') as 'masc' | 'fem' | 'neut', number: plural ? 'plural' : 'singular' })
    : '';
  // The head's own determiner, from forms that have dropped `proper` the way `possessedHeadForms`
  // drops it for a possessed name ("diese Asien von ihr").
  const ownForms = { ...possessedHeadForms(np, 'bare'), definiteness: forms['definiteness'] ?? 'definite' };
  // der/die/das · ein/eine/einen · (bare) · das große Asien
  const art = !pronominal || detached ? determiner(articledNameForms(np, pronominal ? ownForms : undefined), _case, plural)
    : forms['definiteness'] === 'all' ? `${determiner(ownForms, _case, plural)} ${possessive}`
    : possessive;
  // A cardinal stands between the determiner and the declined adjectives: "die zwei großen Häuser"
  // (C31). It declines only at one, where it is the indefinite article's own word, and the article
  // builder has already written that; from two up German's cardinals are invariable.
  const numeral = numeralText(forms, CARDINALS);
  const lead = [art, numeral].filter(Boolean).map((w) => `${w} `).join('');
  const vonPhrase = detached && pronominal ? ` von ${dativePronounDe(pronominal)}` : '';
  return `${lead}${a}${word}${postnominal(forms)}${modifierGenitives(np)}${vonPhrase}${possessorText(np)}${nounStandard(np, _case)}${subordinateClause(np)}`;
}
