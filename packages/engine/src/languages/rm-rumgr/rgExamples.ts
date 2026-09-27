import type { ResolvedNounPhrase } from '../../types.js';
import { RG_EXAMPLES } from './rumgr.consts.js';
import { tonicPronoun } from '../../functions/tonicPronoun.js';
import { coordinate } from './coordinate.js';
import { npText } from './npText.js';

/**
 * The members of the head's set a noun phrase names after it (P09-E33), with a leading space or
 * comma, or ''. *Sco* runs on ("animals sco il giat"); *inclusiv* is parenthetical and invariable
 * (verify), set off on both sides: "ils animals, inclusiv il giat,". A pronoun takes its tonic form.
 */
export function rgExamples(np: ResolvedNounPhrase): string {
  const ex = np.examples;
  if (!ex) return '';
  const group = coordinate(ex.phrase, (s) => tonicPronoun(s) ?? npText(s));
  if (ex.relation === 'example') return ` ${RG_EXAMPLES.example} ${group}`;
  return `, ${RG_EXAMPLES.inclusion} ${group},`;
}
