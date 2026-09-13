import { isPronominalPossessor, type ResolvedNounPhrase } from '../../types.js';
import { adjPhrase } from './adjPhrase.js';
import { datPluralN } from './datPluralN.js';
import { defArticle } from './defArticle.js';
import { germanCompound } from './germanCompound.js';
import { modifierGenitives } from './modifierGenitives.js';
import { subordinateClause } from './subordinateClause.js';
import { weakN } from './weakN.js';

/**
 * A possessor rendered colloquially as "von" + dative ("das Buch vom Kind"): von+dem
 * fuses to "vom", otherwise "von der/den". The possessor's adjectives decline dative;
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
  const art = defArticle(f, 'dat', plural); // dem / der / den
  const von = art === 'dem' ? 'vom' : `von ${art}`;
  const declined = adjPhrase(poss, 'dat');
  const adj = declined ? `${declined} ` : '';
  return ` ${von} ${adj}${word}${modifierGenitives(poss)}${possessorText(poss)}${subordinateClause(poss)}`;
}
