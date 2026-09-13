import type { Tense } from '@signi/shared';
import type { ConceptForms, RubySegment } from '../../types.js';
import { masuEnding } from './masuEnding.js';
import { modalSuffixSeg } from './modalSuffixSeg.js';
import { wordSeg } from './wordSeg.js';

/**
 * The outermost modal's inflected ending — it alone carries tense and polarity. A verb-kind
 * modal takes the ordinary ます paradigm on its stem (行く必要があります); 〜たい is an
 * i-adjective, so it inflects as one (行きたいです / 行きたくなかったです).
 */
export function modalEndingSegs(m: ConceptForms, tense: Tense, negative: boolean): RubySegment[] {
  const past = tense === 'past';
  if (m.forms['kind'] !== 'iadj') {
    return [modalSuffixSeg(m, 'stem'), { t: masuEnding(tense, negative) }];
  }
  const dict = m.forms['suffix_dict'] ?? '';
  const dictReading = m.forms['suffix_dict_reading'];
  const ending = negative
    ? (past ? 'くなかったです' : 'くないです')
    : (past ? 'かったです' : 'いです');
  // Strip the adjective's final い; the ending supplies its own.
  return [wordSeg(dict.slice(0, -1), dictReading?.slice(0, -1)), { t: ending }];
}
