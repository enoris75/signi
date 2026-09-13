import { isPronominalPossessor, type ResolvedNounPhrase } from '../../types.js';
import { dePrep } from './dePrep.js';
import { ptAdj } from './ptAdj.js';
import { withAdj } from './withAdj.js';
import { withRelative } from './withRelative.js';

/**
 * A postnominal possessor, headed by "de"+article ("o livro do gato"). Recurses through
 * withRelative so the possessor carries its own adjectives / nested possessor / relative
 * clause. Empty when the phrase has no possessor.
 */
export function possessorText(np: ResolvedNounPhrase): string {
  const poss = np.possessor;
  // A pronominal possessor ("o seu") is prenominal — rendered by `ptPossessiveWord` in place of
  // the article — so it contributes nothing postnominally here.
  if (!poss || isPronominalPossessor(poss)) return '';
  const f = poss.head.forms;
  const plural = (f['number'] ?? f['count']) === 'plural';
  const word = plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? '');
  return ` ${withRelative(`${dePrep(f, plural)} ${withAdj(word, ptAdj(poss))}`, poss)}`;
}
