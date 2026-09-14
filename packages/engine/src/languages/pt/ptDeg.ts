import type { ConceptForms } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { PT_DEGREE } from './pt.consts.js';

/** Prefix an adjective's degree adverb onto its already-agreed surface ("mais grande"). */
export function ptDeg(a: ConceptForms, surface: string): string {
  const d = PT_DEGREE[adjDegree(a)];
  return d && surface ? `${d} ${surface}` : surface;
}
