import { isPronominalPossessor } from '@signi/shared';
import type { ResolvedNounPhrase } from '../../types.js';
import { possessedHeadForms } from '../../functions/possessedHeadForms.js';
import { artForms } from './artForms.js';
import { deDet } from './deDet.js';
import { esAdj } from './esAdj.js';
import { withAdj } from './withAdj.js';
import { withRelative } from './withRelative.js';
import { esPossessiveWord } from './esPossessiveWord.js';

/**
 * A postnominal possessor, headed by "de" + its own determiner ("el libro del gato", "de un
 * hombre", "de algunos hombres"). Recurses through withRelative so the possessor carries its own
 * adjectives / nested possessor / relative clause. Empty when the phrase has no possessor.
 */
export function possessorText(np: ResolvedNounPhrase): string {
  const poss = np.possessor;
  // A pronominal possessor ("su") is prenominal — rendered by `esPossessiveWord` in place of the
  // article — so it contributes nothing postnominally here.
  if (!poss || isPronominalPossessor(poss)) return '';
  // The possessor's own possessive replaces its article after "de" ("el libro de mi perro").
  const f = possessedHeadForms(poss, 'bare');
  const plural = (f['number'] ?? f['count']) === 'plural';
  const word = plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? '');
  const adj = esAdj(poss);
  const noun = [esPossessiveWord(poss), withAdj(word, adj)].filter(Boolean).join(' ');
  return ` ${withRelative(`${deDet(artForms(f, adj), plural)} ${noun}`, poss)}`;
}
