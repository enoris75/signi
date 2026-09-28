import type { ResolvedNounPhrase } from '../../types.js';
import { PL_EXAMPLES } from './pl.consts.js';
import { elementText } from './elementText.js';

/**
 * The members of a head's set named after it (P09-E33), set off by commas: *zwierzęta, jak kot,* (such
 * as) and *zwierzęta, w tym kot,* (including), the example in the nominative (verify: *w tym* is often
 * followed by the head's case).
 */
export function examplesText(np: ResolvedNounPhrase): string {
  if (!np.examples) return '';
  return `, ${PL_EXAMPLES[np.examples.relation]} ${elementText(np.examples.phrase, 'nom')},`;
}
