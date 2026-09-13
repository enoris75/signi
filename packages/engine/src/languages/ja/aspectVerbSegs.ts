import type { ResolvedVerbPhrase, RubySegment } from '../../types.js';
import { wordSeg } from './wordSeg.js';

/**
 * The verb segment(s) for a non-neutral aspect, built on the te-form (`forms['te']`):
 *   progressive → ～ています ("行っています", past ～ていました)
 *   resultative → ～てしまいます (completion; "行ってしまいました")
 *   prospective → dictionary form + ところです ("行くところです", past ～ところでした)
 * Future reuses the present, as elsewhere in the Japanese engine.
 */
export function aspectVerbSegs(verbPhrase: ResolvedVerbPhrase, negative: boolean): RubySegment[] {
  const { verb, tense = 'present', aspect = 'neutral' } = verbPhrase;
  const past = tense === 'past';
  if (aspect === 'prospective') {
    // The copula carries the polarity: affirmative です/でした, negative ではありません(でした) —
    // the same copula negation the na-adjective/noun predicate uses. Without this the prospective
    // renders identically for both polarities.
    const cop = negative
      ? (past ? 'ではありませんでした' : 'ではありません')
      : (past ? 'でした' : 'です');
    return [wordSeg(verb.forms['base'] ?? '', verb.forms['reading']), { t: 'ところ' }, { t: cop }];
  }
  // Progressive (～ている) and resultative (～てしまう) both build on the te-form.
  const te = verb.forms['te'];
  const teSeg = te ? wordSeg(te, verb.forms['te_reading']) : wordSeg(verb.forms['base'] ?? '', verb.forms['reading']);
  const stem = aspect === 'resultative' ? 'しまい' : 'い'; // てしまう vs ている (polite い-stem)
  const suffix = negative
    ? (past ? `${stem}ませんでした` : `${stem}ません`)
    : (past ? `${stem}ました` : `${stem}ます`);
  return [teSeg, { t: suffix }];
}
