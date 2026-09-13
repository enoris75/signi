import type { ConceptForms } from '../../types.js';
import { isLoweredDegree } from './isLoweredDegree.js';

/**
 * An adjective's surface for its degree. The lowered degrees (less/least) put the adjective into
 * its plain negative — i-adjective 大きい → 大きくない, na-adjective 幸せな → 幸せではない — because a
 * lowered degree is negative-polarity in Japanese. The result itself ends in …ない (an
 * i-adjective), so every downstream position (attributive 大きくない, adverbial 大きくなく, copula
 * 大きくないです) is handled by the ordinary い-adjective machinery. Every other degree keeps the
 * stored base. Furigana tracks the same substitution (whole-word ruby, as elsewhere).
 */
export function jaComparisonAdj(concept: ConceptForms): { base: string; reading?: string } {
  const base = concept.forms['base'] ?? '';
  const reading = concept.forms['reading'];
  if (concept.forms['role'] !== 'adjective' || !isLoweredDegree(concept)) return { base, reading };
  const negate = (s: string): string =>
    s.endsWith('な') ? `${s.slice(0, -1)}ではない`
    : s.endsWith('い') ? `${s.slice(0, -1)}くない`
    : `${s}ではない`;
  return { base: negate(base), reading: reading ? negate(reading) : reading };
}
