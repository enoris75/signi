import { isPronominalPossessor } from '@signi/shared';
import { isQuestionPossessor } from '../../functions/questionPossessor.js';
import type { ResolvedNounPhrase } from '../../types.js';
import { numeralText } from '../../functions/numeralText.js';
import { oneBesideDeterminer } from '../../functions/oneBesideDeterminer.js';
import { CARDINALS } from './ca.consts.js';
import { artForms } from './artForms.js';
import { deDet } from './deDet.js';
import { caAdj } from './caAdj.js';
import { joinHead } from './joinHead.js';
import { npText } from './npText.js';
import { withAdj } from './withAdj.js';
import { withRelative } from './withRelative.js';
import { caPossessiveWord } from './caPossessiveWord.js';

/**
 * A postnominal possessor, headed by *de* + its own determiner ("el llibre del gat", "d'un home", "de
 * la dona"). Recurses through `withRelative` so the possessor carries its own adjectives, possessor and
 * relative. Empty when the phrase has no possessor, or a pronominal one (the possessive is the noun
 * phrase's own: "el meu gat").
 */
export function possessorText(np: ResolvedNounPhrase): string {
  const poss = np.possessor;
  if (!poss || isPronominalPossessor(poss)) return '';
  // A possessor question's stand-in is *de qui* in the same slot: "el gat de qui" (P09-E14).
  if (isQuestionPossessor(poss)) return ' de qui';
  // A possessor with a possessive of its own is a whole noun phrase after "de": "de la meva gata",
  // "d'aquest llibre meu", "de tots els meus llibres".
  const possessive = caPossessiveWord(poss);
  if (possessive) return ` de ${npText(poss)}`;
  const f = poss.head.forms;
  const plural = (f['number'] ?? f['count']) === 'plural';
  const word = plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? '');
  const adj = caAdj(poss);
  // A counted possessor keeps its cardinal ("un període de vint-i-quatre hores", C31); at one beside
  // a definite or demonstrative it is left out (A319).
  const numeral = oneBesideDeterminer(f, false) ? '' : numeralText(f, CARDINALS);
  const noun = [numeral, withAdj(word, adj)].filter(Boolean).join(' ');
  const af = artForms(f, adj);
  return ` ${withRelative(joinHead(deDet(af, plural), noun, af, adj, numeral), poss)}`;
}
