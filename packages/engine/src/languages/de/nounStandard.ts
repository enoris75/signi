import { isPronominalPossessor } from '@signi/shared';
import type { ResolvedNounPhrase } from '../../types.js';
import { coordinate } from './coordinate.js';
import type { Case } from './de.types.js';
import { deStandard } from './deStandard.js';
import { determiner } from './determiner.js';
import { nounPhrase } from './nounPhrase.js';
import { prepDet } from './prepDet.js';

/**
 * The standard of comparison of a noun phrase's one attributive adjective (P09-E18), with a leading
 * space, or ''. The adjective stays before the noun, declined as ever, and the standard follows the
 * noun in `_case`, the phrase's own: "sieht einen größeren Kater **als den Hund**", "ist ein größeres
 * Tier **als der Hund**", "gibt einem größeren Kater **als dem Hund** das Buch" — "als" and "wie" are
 * conjunctions, and the standard is parallel to the phrase it compares with.
 *
 * It stands after the noun's genitives, its possessor included, and before a relative clause: "einen
 * größeren Kater der Frau als den Hund", since "*als den Hund der Frau" would give the woman's dog.
 *
 * A superlative's set is a genitive of its own, which behind a genitive possessor would read as the
 * possessor's: "das größte Haus der Frau der Stadt" is the house of the woman of the city. There the
 * set is said as the place it is, "in" + dative: "das größte Haus der Frau in der Stadt" (A380). A
 * set holding a pronoun keeps its "von" ("von uns"), which stacks nothing.
 */
export function nounStandard(np: ResolvedNounPhrase, _case: Case): string {
  const own = np.adjectiveStandard;
  const a = own ? np.adjectives[own.index] : undefined;
  if (!own || !a) return '';
  const genitivePossessor = !!np.possessor && !isPronominalPossessor(np.possessor);
  const placeSet = a.forms['domain'] === '1' && genitivePossessor && !own.standard.conjuncts.some((s) => s.head.forms['person']);
  const text = placeSet ? coordinate(own.standard, inPlace) : deStandard(a, own.standard, _case);
  return text ? ` ${text}` : '';
}

/** "in" + the dative of `s`, fused with a definite "dem" as a locative's is: "in der Stadt", "im Dorf". */
function inPlace(s: ResolvedNounPhrase): string {
  const f = s.head.forms;
  const plural = (f['number'] ?? f['count']) === 'plural';
  const text = nounPhrase(s, 'dat');
  const det = determiner(f, 'dat', plural);
  return det && text.startsWith(`${det} `) ? `${prepDet('in', f, 'dat', plural)}${text.slice(det.length)}` : `in ${text}`;
}
