import type { ConceptForms } from '../../types.js';
import { degreeAdverb } from '../../functions/degreeAdverb.js';
import { withIntensifier } from '../../functions/withIntensifier.js';
import { RG_DEGREE, RG_STANDARD_DEGREE } from './rumgr.consts.js';

/**
 * Prefix an adjective's degree adverb onto its already-agreed surface ("pli grond", "main grond",
 * "uschè grond"), and its intensifier onto that ("fitg grond", "fitg pli grond"; see
 * `withIntensifier`, C33). P04 §2.1.
 */
export function rgDeg(a: ConceptForms, surface: string): string {
  const d = degreeAdverb(a, RG_DEGREE, RG_STANDARD_DEGREE);
  return withIntensifier(a, d && surface ? `${d} ${surface}` : surface);
}
