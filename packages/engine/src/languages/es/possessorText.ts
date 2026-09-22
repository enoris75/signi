import { isPronominalPossessor } from '@signi/shared';
import type { ResolvedNounPhrase } from '../../types.js';
import { possessedHeadForms } from '../../functions/possessedHeadForms.js';
import { KEPT_BESIDE_POSSESSIVE } from '../../possessive.js';
import { artForms } from './artForms.js';
import { deDet } from './deDet.js';
import { esAdj } from './esAdj.js';
import { npText } from './npText.js';
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
  const possessive = esPossessiveWord(poss);
  // Unless the possessor carries a determiner of its own. That keeps its slot and the possessive
  // follows the noun in its stressed form, as it does in the object, which builds it: "de este libro
  // mío", "de ningún libro suyo" (A187 in the noun phrase, A234 here). "de" fuses with none of them.
  if (possessive && KEPT_BESIDE_POSSESSIVE.has(poss.head.forms['definiteness'] ?? 'definite')) {
    return ` de ${npText(poss)}`;
  }
  const f = possessedHeadForms(poss, 'bare');
  const plural = (f['number'] ?? f['count']) === 'plural';
  const word = plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? '');
  const adj = esAdj(poss);
  const noun = [possessive, withAdj(word, adj)].filter(Boolean).join(' ');
  return ` ${withRelative(`${deDet(artForms(f, adj), plural)} ${noun}`, poss)}`;
}
