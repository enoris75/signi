import type { ConceptForms } from '../../types.js';
import { degreeAdverb } from '../../functions/degreeAdverb.js';
import { withIntensifier } from '../../functions/withIntensifier.js';
import { VL_DEGREE, VL_STANDARD_DEGREE } from './vallader.consts.js';

/**
 * Prefix an adjective's degree adverb onto its already-agreed surface ("plü grond", "main grond",
 * "uschè grond"), and its intensifier onto that ("fich grond", "fich plü grond"; see
 * `withIntensifier`, C33). P04 §2.1.
 */
export function vlDeg(a: ConceptForms, surface: string): string {
  const d = degreeAdverb(a, VL_DEGREE, VL_STANDARD_DEGREE);
  return withIntensifier(a, d && surface ? `${d} ${surface}` : surface);
}
