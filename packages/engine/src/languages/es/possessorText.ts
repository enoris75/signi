import { isPronominalPossessor } from '@signi/shared';
import { isQuestionPossessor } from '../../functions/questionPossessor.js';
import type { ResolvedNounPhrase } from '../../types.js';
import { possessedHeadForms } from '../../functions/possessedHeadForms.js';
import { keptBesidePossessive } from '../../possessive.js';
import { numeralText } from '../../functions/numeralText.js';
import { oneBesideDeterminer } from '../../functions/oneBesideDeterminer.js';
import { CARDINALS } from './es.consts.js';
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
  // A possessor question's stand-in is *de quién* in the same slot: "el gato de quién" (P09-E14).
  if (isQuestionPossessor(poss)) return ' de quién';
  // The possessor's own possessive replaces its article after "de" ("el libro de mi perro").
  const possessive = esPossessiveWord(poss);
  // Unless the possessor carries a determiner of its own. That keeps its slot and the possessive
  // follows the noun in its stressed form, as it does in the object, which builds it: "de este libro
  // mío", "de ningún libro suyo" (A187 in the noun phrase, A234 here). "de" fuses with none of them.
  //
  // "todos" keeps its slot too, and is the one determiner that does *not* detach the possessive: it
  // stands in front of the unstressed one, "de todos mis libros" (A237). The object builds that
  // phrase as well, so both go through `npText`.
  const ownDeterminer = poss.head.forms['definiteness'] ?? 'definite';
  if (possessive && (ownDeterminer === 'all' || ownDeterminer === 'most' || keptBesidePossessive(poss.head.forms))) {
    return ` de ${npText(poss)}`;
  }
  const f = possessedHeadForms(poss, 'bare');
  const plural = (f['number'] ?? f['count']) === 'plural';
  const word = plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? '');
  const adj = esAdj(poss);
  // A counted possessor keeps its cardinal: "un período de veinticuatro horas" (C31).
  // …and at one beside a definite or demonstrative it is left out: "del hombre", not "*del un
  // hombre" (A319, A339).
  const numeral = oneBesideDeterminer(poss.head.forms) ? '' : numeralText(f, CARDINALS);
  const noun = [possessive, numeral, withAdj(word, adj)].filter(Boolean).join(' ');
  return ` ${withRelative(`${deDet(artForms(f, adj), plural)} ${noun}`, poss)}`;
}
