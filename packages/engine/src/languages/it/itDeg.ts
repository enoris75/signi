import type { ConceptForms } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { withIntensifier } from '../../functions/withIntensifier.js';
import { IT_DEGREE } from './it.consts.js';

/**
 * Prefix an adjective's degree adverb onto its already-agreed surface ("più grande"), and its
 * intensifier onto that ("molto grande", "molto più grande"; see `withIntensifier`, C33).
 */
export function itDeg(a: ConceptForms, surface: string): string {
  const d = IT_DEGREE[adjDegree(a)];
  return withIntensifier(a, d && surface ? `${d} ${surface}` : surface);
}
