import type { ResolvedNounPhrase } from '../../types.js';
import { tonicPronoun } from '../../functions/tonicPronoun.js';
import { coordinate } from './coordinate.js';
import { npText } from './npText.js';

/**
 * The members of the head's set a noun phrase names after it (P09-E33), with a leading space or
 * comma, or ''. *Comme* runs on ("des animaux comme le chat"); *y compris* is invariable and
 * parenthetical, set off on both sides ("les animaux, y compris le chat,"). A pronoun takes its tonic
 * form: "comme lui", "y compris moi".
 */
export function frExamples(np: ResolvedNounPhrase): string {
  const ex = np.examples;
  if (!ex) return '';
  const group = coordinate(ex.phrase, (s) => tonicPronoun(s) ?? npText(s));
  return ex.relation === 'inclusion' ? `, y compris ${group},` : ` comme ${group}`;
}
