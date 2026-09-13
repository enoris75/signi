import { adjDegree, type ConceptForms } from '../../types.js';
import { ES_DEGREE } from './es.consts.js';

/** Prefix an adjective's degree adverb onto its already-agreed surface ("más grande"). */
export function esDeg(a: ConceptForms, surface: string): string {
  const d = ES_DEGREE[adjDegree(a)];
  return d && surface ? `${d} ${surface}` : surface;
}
