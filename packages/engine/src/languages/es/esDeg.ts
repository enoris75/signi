import type { ConceptForms } from '../../types.js';
import { degreeAdverb } from '../../functions/degreeAdverb.js';
import { withIntensifier } from '../../functions/withIntensifier.js';
import { ES_DEGREE, ES_STANDARD_DEGREE } from './es.consts.js';

/**
 * Prefix an adjective's degree adverb onto its already-agreed surface ("más grande"), and its
 * intensifier onto that ("muy grande", "muy más grande"; see `withIntensifier`, C33).
 */
export function esDeg(a: ConceptForms, surface: string): string {
  // Before a standard the equative is "tan grande (como el perro)", not "igual de" (P09-E5).
  const d = degreeAdverb(a, ES_DEGREE, ES_STANDARD_DEGREE);
  return withIntensifier(a, d && surface ? `${d} ${surface}` : surface);
}
