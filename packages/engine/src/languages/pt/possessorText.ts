import { isPronominalPossessor } from '@signi/shared';
import type { ResolvedNounPhrase } from '../../types.js';
import { possessedHeadForms } from '../../functions/possessedHeadForms.js';
import { KEPT_BESIDE_POSSESSIVE } from '../../possessive.js';
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
  // Unless the possessor carries a determiner of its own: that keeps its slot and takes the fusion
  // ("deste", "de nenhum"), and the possessive follows the noun, article and all left to the
  // determiner, as in the object — "deste livro meu", "de nenhum livro seu" (A187 in the noun phrase,
  // A234 here).
  const possessive = ptPossessiveWord(poss, false);
  const ownDeterminer = poss.head.forms['definiteness'] ?? 'definite';
  const detached = !!possessive && KEPT_BESIDE_POSSESSIVE.has(ownDeterminer);
  const possessed = possessedHeadForms(poss, 'definite');
  const f = detached ? { ...possessed, definiteness: ownDeterminer } : possessed;
  const plural = (f['number'] ?? f['count']) === 'plural';
  const word = plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? '');
  const head = withAdj(word, ptAdj(poss));
  const noun = (detached ? [head, possessive] : [possessive, head]).filter(Boolean).join(' ');
  return ` ${withRelative(`${contractDet(dePrep, 'de', f, plural)} ${noun}`, poss)}`;
}
