import type { ConceptForms } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { FR_DEGREE } from './fr.consts.js';

/**
 * Prefix an adjective's degree adverb onto its surface ("plus grand"). An equative intensifier is
 * the degree's word itself ("tout aussi grand"; see `applyIntensifier`, A255), so it takes none.
 */
export function frDeg(a: ConceptForms, surface: string): string {
  const d = a.forms['intensifier_equative'] === '1' ? '' : FR_DEGREE[adjDegree(a)];
  return d && surface ? `${d} ${surface}` : surface;
}
