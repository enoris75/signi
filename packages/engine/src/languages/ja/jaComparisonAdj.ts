import type { ConceptForms } from '../../types.js';
import { isLoweredDegree } from './isLoweredDegree.js';
import { jaAdjClass } from './jaAdjClass.js';

/**
 * An adjective's surface for its degree. The lowered degrees (less/least) put the adjective into
 * its plain negative — i-adjective 大きい → 大きくない, na-adjective 幸せな → 幸せではない, の-adjective
 * 茶色の → 茶色ではない, た-adjective 疲れた → 疲れていない — because a
 * lowered degree is negative-polarity in Japanese. The result itself ends in …ない (an
 * i-adjective), so every downstream position (attributive 大きくない, adverbial 大きくなく, copula
 * 大きくないです) is handled by the ordinary い-adjective machinery. Every other degree keeps the
 * stored base. Furigana tracks the same substitution (whole-word ruby, as elsewhere).
 */
export function jaComparisonAdj(concept: ConceptForms): { base: string; reading?: string } {
  const base = concept.forms['base'] ?? '';
  const reading = concept.forms['reading'];
  if (concept.forms['role'] !== 'adjective' || !isLoweredDegree(concept)) return { base, reading };
  // The negative ending by class (see `jaAdjClass`): くない, ではない (幸せな and 茶色の alike), or the
  // negative state ていない (疲れた → 疲れていない).
  const { kind, stem, reading: stemReading } = jaAdjClass(base, reading);
  const ending = kind === 'i' ? 'くない' : kind === 'ta' ? 'いない' : 'ではない';
  return { base: `${stem}${ending}`, reading: stemReading === undefined ? undefined : `${stemReading}${ending}` };
}
