import { isPronominalPossessor } from '@signi/shared';
import type { ResolvedNounPhrase } from '../../types.js';
import { possessedHeadForms } from '../../functions/possessedHeadForms.js';
import { dativePronounDe, KEPT_BESIDE_POSSESSIVE, possessiveDe } from '../../possessive.js';
import type { Case } from './de.types.js';
import { adjPhrase } from './adjPhrase.js';
import { articledNameForms } from './articledNameForms.js';
import { datPluralN } from './datPluralN.js';
import { determiner } from './determiner.js';
import { genitiveS } from './genitiveS.js';
import { germanCompound } from './germanCompound.js';
import { modifierGenitives } from './modifierGenitives.js';
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
  // The genitive is `genitiveS`'s: -(e)s on a masculine/neuter, -(e)n on a weak masculine, or the form
  // the lexicon records ("Namens"). Elsewhere a weak masculine declines to -(e)n in the oblique
  // singular, and every other noun takes the regular dative-plural -n.
  const word = _case === 'gen'
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
  const declined = adjPhrase(np, _case, possessedDeclension(np, forms));
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
  const lead = art ? `${art} ` : '';
  const vonPhrase = detached && pronominal ? ` von ${dativePronounDe(pronominal)}` : '';
  return `${lead}${a}${word}${postnominal(forms)}${modifierGenitives(np)}${vonPhrase}${possessorText(np)}${subordinateClause(np)}`;
}
