import type { ConceptForms } from '../../types.js';
import { degreeAdverb } from '../../functions/degreeAdverb.js';
import { withIntensifier } from '../../functions/withIntensifier.js';
import { SURSILV_DEGREE, SURSILV_STANDARD_DEGREE } from './sursilv.consts.js';

/**
 * Prefix an adjective's degree adverb onto its already-agreed surface ("pli grond", "meins grond",
 * "aschi grond"), and its intensifier onto that ("fitg grond", "fitg pli grond"; see
 * `withIntensifier`, C33). P04 §2.1.
 */
export function sursilvDeg(a: ConceptForms, surface: string): string {
  const d = degreeAdverb(a, SURSILV_DEGREE, SURSILV_STANDARD_DEGREE);
  return withIntensifier(a, d && surface ? `${d} ${surface}` : surface);
}
