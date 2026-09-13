import { isPronominalPossessor, possessedHeadForms, type ResolvedNounPhrase } from '../../types.js';
import { contractDet } from './contractDet.js';
import { dePrep } from './dePrep.js';
import { ptAdj } from './ptAdj.js';
import { withAdj } from './withAdj.js';
import { withRelative } from './withRelative.js';
import { ptPossessiveWord } from './ptPossessiveWord.js';

/**
 * A postnominal possessor, headed by "de" + its own determiner ("o livro do gato", "de um gato",
 * "deste gato"). Recurses through withRelative so the possessor carries its own adjectives /
 * nested possessor / relative clause. Empty when the phrase has no possessor.
 */
export function possessorText(np: ResolvedNounPhrase): string {
  const poss = np.possessor;
  // A pronominal possessor ("o seu") is prenominal — rendered by `ptPossessiveWord` in place of
  // the article — so it contributes nothing postnominally here.
  if (!poss || isPronominalPossessor(poss)) return '';
  // The possessor's own possessive rides on the article "de" fuses with ("o livro do meu cão").
  const f = possessedHeadForms(poss, 'definite');
  const plural = (f['number'] ?? f['count']) === 'plural';
  const word = plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? '');
  const noun = [ptPossessiveWord(poss, false), withAdj(word, ptAdj(poss))].filter(Boolean).join(' ');
  return ` ${withRelative(`${contractDet(dePrep, 'de', f, plural)} ${noun}`, poss)}`;
}
