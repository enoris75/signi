import { adjDegree, type ConceptForms } from '../../types.js';
import { IT_DEGREE } from './it.consts.js';

/** Prefix an adjective's degree adverb onto its already-agreed surface ("più grande"). */
export function itDeg(a: ConceptForms, surface: string): string {
  const d = IT_DEGREE[adjDegree(a)];
  return d && surface ? `${d} ${surface}` : surface;
}
