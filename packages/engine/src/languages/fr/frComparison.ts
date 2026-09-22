import type { ConceptForms } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { withIntensifier } from '../../functions/withIntensifier.js';
import { FR_SUPPLETIVE } from './fr.consts.js';
import { agreeAdjFr } from './agreeAdjFr.js';
import { frDeg } from './frDeg.js';

/**
 * An adjective's comparison surface, agreed with the noun. A suppletive raised degree replaces
 * the base outright and is itself agreed (meilleur → meilleure/meilleurs); every other case is
 * the periphrastic degree adverb prefixed onto the agreed base ("plus grand", "moins bon").
 *
 * An intensifier leads the finished surface, agreement and degree included ("très grand", "très
 * grandes"; see `withIntensifier`, C33). It is an adverb, so it never agrees itself.
 */
export function frComparison(a: ConceptForms, gender: string, plural: boolean): string {
  const degree = adjDegree(a);
  const suppletive = FR_SUPPLETIVE[a.conceptId];
  if (suppletive && (degree === 'more' || degree === 'most')) {
    return withIntensifier(a, agreeAdjFr(suppletive, gender, plural));
  }
  return withIntensifier(a, frDeg(a, agreeAdjFr(a.forms['base'] ?? '', gender, plural)));
}
