import { isPronominalPossessor } from '@signi/shared';
import type { ResolvedNounPhrase } from '../../types.js';
import { adjPhrase } from './adjPhrase.js';
import { adjectivalNoun } from './adjectivalNoun.js';
import { articledNameForms } from './articledNameForms.js';
import { datPluralN } from './datPluralN.js';
import { numeralText } from '../../functions/numeralText.js';
import { CARDINALS } from './de.consts.js';
import { determiner } from './determiner.js';
import { genitiveShows } from './genitiveShows.js';
import { germanCompound } from './germanCompound.js';
import { modifierGenitives } from './modifierGenitives.js';
import { nounStandard } from './nounStandard.js';
import { nounPhrase } from './nounPhrase.js';
import { postnominal } from './postnominal.js';
import { subordinateClause } from './subordinateClause.js';
import { weakN } from './weakN.js';

/**
 * A noun possessor, space-led, or "" when there is none. Standard German postposes it in the
 * genitive, the whole phrase declined: its own determiner or possessive, its adjectives, the noun's
 * -(e)s or weak -(e)n ("das Buch des Katers", "eines Hundes", "der Katze", "des Jungen", "meines
 * großen Hundes", "einiger kleiner Kater", "Europas", "des großen Asiens"), with its own nested
 * possessor and relative clause after it.
 *
 * Where the genitive would not show (see `genitiveShows`), German takes "von" + the dative instead:
 * a determinerless plural or mass noun ("das Buch von Katzen", "von Wasser"), one under an invariant
 * quantifier ("von etwas Wasser").
 */
export function possessorText(np: ResolvedNounPhrase): string {
  const poss = np.possessor;
  // A pronominal possessor ("sein") is prenominal — rendered as an ein-word in place of the
  // article — so it adds nothing postposed here.
  if (!poss || isPronominalPossessor(poss)) return '';
  return ` ${genitiveShows(poss) ? nounPhrase(poss, 'gen') : vonDative(poss)}`;
}

// "von" + the dative, for a possessor whose genitive would not show. No article can be there for
// "von" to fuse with: at most an invariant quantifier, after which an adjective declines strong ("von
// etwas kaltem Wasser").
function vonDative(poss: ResolvedNounPhrase): string {
  const f = articledNameForms(poss);
  const plural = (f['number'] ?? f['count']) === 'plural';
  const compound = germanCompound(poss, plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? ''));
  const definiteness = f['definiteness'] ?? 'definite';
  // An adjectival noun takes the dative adjective ending here too, and none of the noun rules: "eine
  // Gruppe von Verwandten", not "*von Verwandtn" (P11 D8, localization B68).
  const word = f['adjectival'] === '1'
    ? adjectivalNoun(compound, f, 'dat', definiteness, plural)
    : f['weak'] === '1' ? weakN(compound, 'dat', plural) : datPluralN(compound, 'dat', plural);
  const words = [
    'von',
    determiner(f, 'dat', plural),
    // A counted possessor keeps its cardinal: "ein Zeitraum von vierundzwanzig Stunden" (C31).
    numeralText(f, CARDINALS),
    adjPhrase(poss, 'dat', definiteness),
    `${word}${postnominal(f)}${modifierGenitives(poss)}${possessorText(poss)}${nounStandard(poss, 'dat')}${subordinateClause(poss)}`,
  ];
  return words.filter(Boolean).join(' ');
}
