import type { ResolvedNounPhrase } from '../../types.js';
import { SURSILV_EXAMPLES } from './sursilv.consts.js';
import { tonicPronoun } from '../../functions/tonicPronoun.js';
import { coordinate } from './coordinate.js';
import { npText } from './npText.js';

/**
 * The members of the head's set a noun phrase names after it (P09-E33), with a leading space or
 * comma, or ''. *Sco* runs on ("animals sco il gat"); *inclusiv* is parenthetical and invariable
 * (verify), set off on both sides: "ils animals, inclusiv il gat,". A pronoun takes its tonic form.
 */
export function sursilvExamples(np: ResolvedNounPhrase): string {
  const ex = np.examples;
  if (!ex) return '';
  const group = coordinate(ex.phrase, (s) => tonicPronoun(s) ?? npText(s));
  if (ex.relation === 'example') return ` ${SURSILV_EXAMPLES.example} ${group}`;
  return `, ${SURSILV_EXAMPLES.inclusion} ${group},`;
}
