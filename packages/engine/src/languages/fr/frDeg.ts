import { adjDegree, type ConceptForms } from '../../types.js';
import { FR_DEGREE } from './fr.consts.js';

/** Prefix an adjective's degree adverb onto its surface ("plus grand"). */
export function frDeg(a: ConceptForms, surface: string): string {
  const d = FR_DEGREE[adjDegree(a)];
  return d && surface ? `${d} ${surface}` : surface;
}
