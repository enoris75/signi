import type { ResolvedNounPhrase } from '../../types.js';
import { numeralText } from '../../functions/numeralText.js';
import { oneBesideDeterminer } from '../../functions/oneBesideDeterminer.js';
import { CARDINALS } from './ca.consts.js';
import { npText } from './npText.js';
import { aDet } from './aDet.js';
import { artForms } from './artForms.js';
import { deDet } from './deDet.js';
import { caAdj } from './caAdj.js';
import { caPossessiveWord } from './caPossessiveWord.js';
import { isPlural } from './isPlural.js';
import { joinHead } from './joinHead.js';
import { prepDet } from './prepDet.js';
import { withAdj } from './withAdj.js';
import { withRelative } from './withRelative.js';

/**
 * One conjunct of an object that a preposition leads, as a complement's noun phrase: "clica al botó",
 * "depèn de la casa", "en una casa" (A139). A pronoun takes its tonic form after the preposition ("de
 * mi", "amb ell"); it is no clitic there. A possessed noun is a whole noun phrase after it: "a la meva
 * casa".
 */
export function prepObjectText(np: ResolvedNounPhrase, prep: string): string {
  const pf = np.head.forms;
  if (pf['person']) return withRelative(`${prep} ${pf['disjunctive'] ?? pf['base'] ?? ''}`, np);
  if (caPossessiveWord(np)) return `${prep} ${npText(np)}`;
  const plural = isPlural(pf);
  const adj = caAdj(np);
  const word = plural ? (pf['plural'] ?? pf['base'] ?? '') : (pf['base'] ?? '');
  // A cardinal stands after the determiner, before the noun (A319, A340): "als dos amics".
  const numeral = oneBesideDeterminer(pf, false) ? '' : numeralText(pf, CARDINALS);
  const noun = [numeral, withAdj(word, adj)].filter(Boolean).join(' ');
  const af = artForms(pf, adj);
  const head = prep === 'a' ? aDet(af, plural) : prep === 'de' ? deDet(af, plural) : prepDet(prep, af, plural);
  return withRelative(joinHead(head, noun, af, adj, numeral), np);
}
