import { isPronominalPossessor, type ResolvedNounPhrase } from '../../types.js';
import { possessiveDe } from '../../possessive.js';
import type { Case } from './de.types.js';
import { adjPhrase } from './adjPhrase.js';
import { datPluralN } from './datPluralN.js';
import { determiner } from './determiner.js';
import { genitiveS } from './genitiveS.js';
import { germanCompound } from './germanCompound.js';
import { modifierGenitives } from './modifierGenitives.js';
import { possessorText } from './possessorText.js';
import { subordinateClause } from './subordinateClause.js';
import { weakN } from './weakN.js';

export function nounPhrase(np: ResolvedNounPhrase, _case: Case): string {
  const forms = np.head.forms;
  const count = forms['number'] ?? forms['count'] ?? 'singular';
  const plural = count === 'plural';
  const headWord = plural ? (forms['plural'] ?? forms['base'] ?? '') : (forms['base'] ?? '');
  const compound = germanCompound(np, headWord);
  // A weak masculine noun declines to -(e)n in the oblique singular (and takes no genitive -(e)s);
  // every other noun takes the regular dative-plural -n and masculine/neuter genitive -(e)s.
  const word = forms['weak'] === '1'
    ? weakN(compound, _case, plural)
    : genitiveS(datPluralN(compound, _case, plural), _case, forms, plural);
  // A pronominal possessor ("sein Hund") is a prenominal ein-word possessive replacing the
  // article, declined for this possessed head's case/gender/number. Following adjectives then take
  // the mixed (ein-word) declension, so the phrase declines like an indefinite one.
  const poss = np.possessor;
  const pronominalPoss = poss && isPronominalPossessor(poss);
  const definiteness = pronominalPoss ? 'indefinite' : (forms['definiteness'] ?? 'definite');
  const declined = adjPhrase(np, _case, definiteness);
  const a = declined ? `${declined} ` : '';
  const art = poss && isPronominalPossessor(poss)
    ? possessiveDe(poss, _case, { gender: (forms['gender'] ?? 'neut') as 'masc' | 'fem' | 'neut', number: plural ? 'plural' : 'singular' })
    : determiner(forms, _case, plural); // der/die/das · ein/eine/einen · (bare)
  const lead = art ? `${art} ` : '';
  return `${lead}${a}${word}${modifierGenitives(np)}${possessorText(np)}${subordinateClause(np)}`;
}
