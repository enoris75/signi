import type { RubySegment } from '../../types.js';
import type { JaForm } from './ja.types.js';

/**
 * A **negated** element in the form its governing modal asks for (A03). Japanese modality is
 * suffixal, so a negation under a modal is not a separate word standing before the verb: it is the
 * ない form of whatever the suffix attaches to.
 *
 * - a `dict` governor (〜必要がある, 〜ことができる) attaches straight to the plain ない form, which
 *   is what the caller hands in: 行かない必要がある, 行かないことができる, できない必要がある.
 * - a `stem` governor (〜たい) cannot: ない is an i-adjective and has no polite stem for たい to sit
 *   on (*行かないたい). The negation goes through 〜ないでいる "stay not doing", whose stem is
 *   ない…でい, and the suffix attaches to that: 行かないでいたい.
 *
 * The bridge is spelled here once and reused for every governed element — the main verb
 * (`plainVerbSeg`), an inner modal's own suffix (`modalEndingSegs`'s plain negative) and an aspect
 * (`aspectFormSegs`). The copula spells its own negatives in `copulaSegs`'s ending tables, with the
 * same でい tail (幸せでない / 幸せでないでい).
 */
export function naiSegs(nai: RubySegment[], form: JaForm): RubySegment[] {
  return form === 'dict' ? nai : [...nai, { t: 'でい' }];
}
