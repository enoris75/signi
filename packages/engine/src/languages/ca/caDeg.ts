import type { ConceptForms } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { degreeAdverb } from '../../functions/degreeAdverb.js';
import { withIntensifier } from '../../functions/withIntensifier.js';
import { CA_DEGREE, CA_STANDARD_DEGREE, CA_SUPPLETIVE } from './ca.consts.js';

/**
 * An adjective's degree before its already-agreed surface ("més gran", "menys gran", "tan gran"), and
 * its intensifier before that ("molt gran"; see `withIntensifier`, C33). *bo* and *dolent* compare
 * suppletively (`CA_SUPPLETIVE`): "més bo" is *millor*, "el més bo" *el millor*, plural *millors*.
 */
export function caDeg(a: ConceptForms, surface: string, plural = false): string {
  const degree = adjDegree(a);
  const suppletive = CA_SUPPLETIVE[a.forms['base'] ?? ''];
  if (suppletive && (degree === 'more' || degree === 'most')) {
    return withIntensifier(a, plural ? `${suppletive}s` : suppletive);
  }
  const d = degreeAdverb(a, CA_DEGREE, CA_STANDARD_DEGREE);
  return withIntensifier(a, d && surface ? `${d} ${surface}` : surface);
}
