import { isPronominalPossessor } from '@signi/shared';
import { isQuestionPossessor } from '../../functions/questionPossessor.js';
import type { ResolvedNounPhrase } from '../../types.js';
import { keptBesidePossessive } from '../../possessive.js';

/**
 * A bare phrase counted by one, as the indefinite phrase it is. German's cardinal one is the ein-word
 * and declines as the indefinite article does — "mit einem Hund", "innerhalb einer Stunde", "sieht
 * einen Hund" — so the phrase takes the article's determiner, and the noun and its adjectives decline
 * after it ("innerhalb eines Tages", "mit einem alten Hund"), not the cardinal table's undeclined
 * "ein" (A321). An approximator moves in front of that determiner: "etwa eine Stunde".
 *
 * Every other phrase is returned as it is: a definite or demonstrative one (A319), a possessive (the
 * possessive is the ein-word slot), a mass noun, which takes no indefinite article.
 */
export function cardinalOne(np: ResolvedNounPhrase): ResolvedNounPhrase {
  const forms = np.head.forms;
  if (forms['numeral'] !== '1' || forms['definiteness'] !== 'bare' || forms['uncountable'] === '1') return np;
  // A prenominal possessive has the ein-word slot. One that detaches beside the one it counts leaves
  // the slot to it: "einen Freund von mir" (A329, `keptBesidePossessive`).
  if (np.possessor && isPronominalPossessor(np.possessor) && !keptBesidePossessive(forms)) return np;
  if (isQuestionPossessor(np.possessor)) return np;
  const { numeral: _numeral, approximator, ...rest } = forms;
  const indefinite: Record<string, string> = { ...rest, definiteness: 'indefinite' };
  if (approximator) indefinite['approximator_det'] = approximator;
  return { ...np, head: { ...np.head, forms: indefinite } };
}
