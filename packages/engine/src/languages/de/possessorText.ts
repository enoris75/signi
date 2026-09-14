import { isPronominalPossessor } from '@signi/shared';
import type { ResolvedNounPhrase } from '../../types.js';
import { possessiveDe } from '../../possessive.js';
import { adjPhrase } from './adjPhrase.js';
import { datPluralN } from './datPluralN.js';
import { determiner } from './determiner.js';
import { germanCompound } from './germanCompound.js';
import { modifierGenitives } from './modifierGenitives.js';
import { postnominal } from './postnominal.js';
import { subordinateClause } from './subordinateClause.js';
import { weakN } from './weakN.js';

/**
 * A possessor rendered colloquially as "von" + dative ("das Buch vom Kind"), with the possessor's own
 * determiner: von+dem fuses to "vom", otherwise "von der/den/einem/einigen…". The possessor's adjectives decline dative;
 * recursion carries its own nested possessor and relative clause. Empty when absent.
 */
export function possessorText(np: ResolvedNounPhrase): string {
  const poss = np.possessor;
  // A pronominal possessor ("sein") is prenominal — rendered as an ein-word in place of the
  // article — so it adds nothing as a postposed von-phrase here.
  if (!poss || isPronominalPossessor(poss)) return '';
  const f = poss.head.forms;
  const plural = (f['number'] ?? f['count']) === 'plural';
  const compound = germanCompound(poss, plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? ''));
  // "von" governs the dative, so a weak masculine possessor declines to -(e)n ("vom Jungen").
  const word = f['weak'] === '1' ? weakN(compound, 'dat', plural) : datPluralN(compound, 'dat', plural);
  // The possessor keeps its own determiner ("von einem Kater", "von einigen Katern", a bare "von
  // Europa"); only the definite "dem" fuses to "vom".
  // The possessor's own possessive is an ein-word in place of its article ("von meinem Hund"), and
  // its adjectives then decline mixed.
  const ownPossessive = poss.possessor && isPronominalPossessor(poss.possessor) ? poss.possessor : undefined;
  const definiteness = ownPossessive ? 'indefinite' : (f['definiteness'] ?? 'definite');
  const art = ownPossessive
    ? possessiveDe(ownPossessive, 'dat', { gender: (f['gender'] ?? 'neut') as 'masc' | 'fem' | 'neut', number: plural ? 'plural' : 'singular' })
    : determiner(f, 'dat', plural);
  const articled = f['proper'] === '1' && f['takes_article'] === '1';
  const von = art === 'dem' && (definiteness === 'definite' || articled) ? 'vom' : art ? `von ${art}` : 'von';
  const declined = adjPhrase(poss, 'dat', definiteness);
  const adj = declined ? `${declined} ` : '';
  return ` ${von} ${adj}${word}${postnominal(f)}${modifierGenitives(poss)}${possessorText(poss)}${subordinateClause(poss)}`;
}
