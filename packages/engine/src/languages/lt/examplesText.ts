import type { ResolvedNounPhrase } from '../../types.js';
import { LT_EXAMPLES } from './lt.consts.js';
import { elementText } from './elementText.js';
import { withPreposition } from './withPreposition.js';

/**
 * The members of a head's set named after it (P09-E33), set off by commas: *gyvūnai, kaip katė,* (such
 * as, the example in the nominative) and *gyvūnai, įskaitant katę,* (including, a participle that
 * governs the accusative) (verify).
 */
export function examplesText(np: ResolvedNounPhrase): string {
  if (!np.examples) return '';
  const gov = LT_EXAMPLES[np.examples.relation];
  return `, ${withPreposition(gov.prep, elementText(np.examples.phrase, gov.case))},`;
}
