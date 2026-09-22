import type { ConceptForms } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { withIntensifier } from '../../functions/withIntensifier.js';
import { ES_DEGREE } from './es.consts.js';

/**
 * Prefix an adjective's degree adverb onto its already-agreed surface ("más grande"), and its
 * intensifier onto that ("muy grande", "muy más grande"; see `withIntensifier`, C33).
 */
export function esDeg(a: ConceptForms, surface: string): string {
  const d = ES_DEGREE[adjDegree(a)];
  return withIntensifier(a, d && surface ? `${d} ${surface}` : surface);
}
