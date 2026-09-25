import type { ResolvedNounPhrase } from '../../types.js';
import { IT_EXAMPLES } from './it.consts.js';
import { tonicPronoun } from '../../functions/tonicPronoun.js';
import { coordinate } from './coordinate.js';
import { isPlural } from './isPlural.js';
import { npText } from './npText.js';

/**
 * The members of the head's set a noun phrase names after it (P09-E33), with a leading space or
 * comma, or ''. *Come* runs on ("animali come il gatto"); *compreso* is parenthetical, set off on
 * both sides, and agrees with the **example**, not the head: "gli animali, compreso il gatto,",
 * "compresa la gatta", "compresi i cani", "comprese le gatte". A pronoun takes its tonic form: "come
 * lui", "compreso me".
 */
export function itExamples(np: ResolvedNounPhrase): string {
  const ex = np.examples;
  if (!ex) return '';
  const group = coordinate(ex.phrase, (s) => tonicPronoun(s) ?? npText(s));
  if (ex.relation === 'example') return ` ${IT_EXAMPLES.example} ${group}`;
  const agreement = ex.phrase.agreement;
  const fem = agreement['gender'] === 'fem';
  const ending = isPlural(agreement) ? (fem ? 'e' : 'i') : (fem ? 'a' : 'o');
  return `, ${IT_EXAMPLES.inclusion.slice(0, -1)}${ending} ${group},`;
}
