import type { ConceptForms } from '../../types.js';
import { degreeAdverb } from '../../functions/degreeAdverb.js';
import { PT_DEGREE, PT_STANDARD_DEGREE } from './pt.consts.js';

/** Prefix an adjective's degree adverb onto its already-agreed surface ("mais grande"). */
export function ptDeg(a: ConceptForms, surface: string): string {
  // Before a standard the equative is "tão grande (como o cão)", not "igualmente" (P09-E5).
  const d = degreeAdverb(a, PT_DEGREE, PT_STANDARD_DEGREE);
  return d && surface ? `${d} ${surface}` : surface;
}
