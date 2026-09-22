import type { ConceptForms } from '../../types.js';
import { isLoweredDegree } from './isLoweredDegree.js';
import { jaAdjClass } from './jaAdjClass.js';

/**
 * An adjective's surface for its intensifier and its degree, with `verbal` saying whether what
 * comes back is a **verb** rather than an adjective (see `jaAdjClass`'s `ru` class).
 *
 * The intensifier comes first. A `suffix` one is 〜すぎる, which is not a word standing before the
 * adjective but an ending on its stem — 大きい → 大きすぎる, 幸せな → 幸せすぎる, 疲れた → 疲れすぎる
 * (the た-adjective's te-stem loses its て) — and the result inflects as the ichidan verb it is
 * (大きすぎます, 大きすぎない), which is what the class is for. A `pre` one is a word and is rendered
 * beside the adjective by each site (see `jaIntensifierSeg`); nothing happens to the adjective.
 * Localization C33.
 *
 * Then the degree. The lowered degrees (less/least) put the adjective into
 * its plain negative — i-adjective 大きい → 大きくない, na-adjective 幸せな → 幸せではない, の-adjective
 * 茶色の → 茶色ではない, た-adjective 疲れた → 疲れていない — because a
 * lowered degree is negative-polarity in Japanese. The result itself ends in …ない (an
 * i-adjective), so every downstream position (attributive 大きくない, adverbial 大きくなく, copula
 * 大きくないです) is handled by the ordinary い-adjective machinery. Every other degree keeps the
 * stored base. Furigana tracks the same substitution (whole-word ruby, as elsewhere).
 */
export function jaComparisonAdj(concept: ConceptForms): { base: string; reading?: string; verbal?: boolean } {
  const adjective = concept.forms['role'] === 'adjective';
  const suffixed = adjective && concept.forms['intensifier_position'] === 'suffix'
    ? suffixIntensifier(concept)
    : undefined;
  const base = suffixed?.base ?? concept.forms['base'] ?? '';
  const reading = suffixed?.reading ?? concept.forms['reading'];
  // An adjective whose Japanese word is a **verb** says so (`ja_verbal`): 起こり得る is 得る, an ichidan
  // verb, and inflects as one — 起こり得ます, 起こり得ない — where the copula would say 起こり得るです.
  // An intensifier's 〜すぎる makes any adjective one, which is the other way in (C33, C30).
  const verbal = !!suffixed || (adjective && concept.forms['ja_verbal'] === '1');
  if (!adjective || !isLoweredDegree(concept)) return { base, reading, ...(verbal ? { verbal: true } : {}) };
  // The negative ending by class (see `jaAdjClass`): くない, ではない (幸せな and 茶色の alike), the
  // negative state ていない (疲れた → 疲れていない), or a verb's plain ない (大きすぎる → 大きすぎない).
  // Every one of them ends in ない, an い-adjective, so what comes back is one whatever went in.
  const { kind, stem, reading: stemReading, predicative } =
    jaAdjClass(base, reading, concept.forms['relational'] === '1', verbal);
  const ending = kind === 'i' ? 'くない' : kind === 'ta' ? 'いない' : kind === 'ru' ? 'ない' : `${predicative}ではない`;
  return { base: `${stem}${ending}`, reading: stemReading === undefined ? undefined : `${stemReading}${ending}` };
}

/**
 * The adjective with its suffix intensifier on: the stem its class gives, the て of a た-adjective's
 * te-stem taken back off (疲れて → 疲れ), and the suffix in place of what was dropped.
 */
function suffixIntensifier(concept: ConceptForms): { base: string; reading?: string } {
  const suffix = concept.forms['intensifier'] ?? '';
  const raw = concept.forms['base'] ?? '';
  const { kind, stem, reading } = jaAdjClass(raw, concept.forms['reading'], concept.forms['relational'] === '1');
  const trim = (s: string) => (kind === 'ta' ? s.slice(0, -1) : s);
  return {
    base: `${trim(stem)}${suffix}`,
    reading: reading === undefined ? undefined : `${trim(reading)}${concept.forms['intensifier_reading'] ?? suffix}`,
  };
}
