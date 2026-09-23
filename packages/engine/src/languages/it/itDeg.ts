import type { ConceptForms } from '../../types.js';
import { degreeAdverb } from '../../functions/degreeAdverb.js';
import { withIntensifier } from '../../functions/withIntensifier.js';
import { IT_DEGREE, IT_STANDARD_DEGREE } from './it.consts.js';

/**
 * Prefix an adjective's degree adverb onto its already-agreed surface ("più grande"), and its
 * intensifier onto that ("molto grande", "molto più grande"; see `withIntensifier`, C33).
 */
export function itDeg(a: ConceptForms, surface: string): string {
  // Before a standard the equative is "tanto grande (quanto il cane)", not "ugualmente" (P09-E5).
  const d = degreeAdverb(a, IT_DEGREE, IT_STANDARD_DEGREE);
  return withIntensifier(a, d && surface ? `${d} ${surface}` : surface);
}
