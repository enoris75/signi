import { isPronominalPossessor, type ResolvedNounPhrase } from '../../types.js';
import { artForms } from './artForms.js';
import { dePrep } from './dePrep.js';
import { esAdj } from './esAdj.js';
import { withAdj } from './withAdj.js';
import { withRelative } from './withRelative.js';

/**
 * A postnominal possessor, headed by "de"+article ("el libro del gato"). Recurses
 * through withRelative so the possessor carries its own adjectives / nested possessor /
 * relative clause. Empty when the phrase has no possessor.
 */
export function possessorText(np: ResolvedNounPhrase): string {
  const poss = np.possessor;
  // A pronominal possessor ("su") is prenominal — rendered by `esPossessiveWord` in place of the
  // article — so it contributes nothing postnominally here.
  if (!poss || isPronominalPossessor(poss)) return '';
  const f = poss.head.forms;
  const plural = (f['number'] ?? f['count']) === 'plural';
  const word = plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? '');
  const adj = esAdj(poss);
  return ` ${withRelative(`${dePrep(artForms(f, adj), plural)} ${withAdj(word, adj)}`, poss)}`;
}
