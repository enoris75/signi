import { isPronominalPossessor } from '@signi/shared';
import { isQuestionPossessor } from '../../functions/questionPossessor.js';
import type { ResolvedNounPhrase } from '../../types.js';
import { ownHeadForms, possessedHeadForms } from '../../functions/possessedHeadForms.js';
import { keptBesidePossessive } from '../../possessive.js';
import { numeralText } from '../../functions/numeralText.js';
import { CARDINALS } from './pt.consts.js';
import { contractDet } from './contractDet.js';
import { dePrep } from './dePrep.js';
import { npText } from './npText.js';
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
  // A possessor question's stand-in is *de quem* in the same slot: "o gato de quem" (P09-E14).
  if (isQuestionPossessor(poss)) return ' de quem';
  // The possessor's own possessive rides on the article "de" fuses with ("o livro do meu cão").
  // Unless the possessor carries a determiner of its own: that keeps its slot and takes the fusion
  // ("deste", "de nenhum"), and the possessive follows the noun, article and all left to the
  // determiner, as in the object — "deste livro meu", "de nenhum livro seu" (A187 in the noun phrase,
  // A234 here).
  const possessive = ptPossessiveWord(poss, false);
  const ownDeterminer = poss.head.forms['definiteness'] ?? 'definite';
  // "todos" keeps its slot too, and is the one determiner that does not detach the possessive: it
  // stands in front of it, article and all ("de todos os meus livros", A237). "de" fuses with the
  // article of an ordinary possessor ("dos meus livros") but not across "todos", so the phrase is
  // the one the object builds, behind a plain "de".
  if (possessive && ownDeterminer === 'all') return ` de ${npText(poss)}`;
  const detached = !!possessive && keptBesidePossessive(poss.head.forms);
  // The partitive "most" keeps its own article, which "de" fuses with and the possessive rides on:
  // "da maioria dos seus gatos" (A314).
  const f = detached || (possessive && ownDeterminer === 'most') ? ownHeadForms(poss) : possessedHeadForms(poss, 'definite');
  const plural = (f['number'] ?? f['count']) === 'plural';
  const word = plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? '');
  // A counted possessor keeps its cardinal: "um período de vinte e quatro horas" (C31).
  const head = [numeralText(f, CARDINALS), withAdj(word, ptAdj(poss))].filter(Boolean).join(' ');
  const noun = (detached ? [head, possessive] : [possessive, head]).filter(Boolean).join(' ');
  return ` ${withRelative(`${contractDet(dePrep, 'de', f, plural)} ${noun}`, poss)}`;
}
