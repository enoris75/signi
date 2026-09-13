import type { Tense } from '@signi/shared';
import type { ConceptForms, RubySegment } from '../../types.js';
import type { JaEnding } from './ja.types.js';
import { masuEnding } from './masuEnding.js';
import { modalSuffixSeg } from './modalSuffixSeg.js';
import { wordSeg } from './wordSeg.js';

/**
 * The outermost modal's inflected ending — it alone carries tense and polarity. A verb-kind
 * modal takes the ordinary ます paradigm on its stem (行く必要があります); 〜たい is an
 * i-adjective, so it inflects as one (行きたいです / 行きたくなかったです).
 *
 * `ending` picks the paradigm (see `JaEnding`). The modals' endings are fixed, so no lexicon form is
 * needed: 〜ある goes ある / あった / ない / なかった, an ichidan できる drops its る for た / ない / なかった,
 * and たら is the plain past + ら (必要があったら, ことができなかったら, たかったら).
 */
export function modalEndingSegs(m: ConceptForms, tense: Tense, negative: boolean, ending: JaEnding = 'polite'): RubySegment[] {
  const past = tense === 'past';
  const dict = m.forms['suffix_dict'] ?? '';
  const dictReading = m.forms['suffix_dict_reading'];
  if (m.forms['kind'] !== 'iadj') {
    if (ending === 'polite') return [modalSuffixSeg(m, 'stem'), { t: masuEnding(tense, negative) }];
    // 〜ある is irregular (its negative is ない); any other verb-kind modal is ichidan (できる).
    const aru = dict.endsWith('ある');
    const cut = aru ? 2 : 1;
    const plainEnding = ending === 'tara'
      ? (negative ? 'なかったら' : aru ? 'あったら' : 'たら')
      : aru
        ? (negative ? (past ? 'なかった' : 'ない') : (past ? 'あった' : 'ある'))
        : (negative ? (past ? 'なかった' : 'ない') : (past ? 'た' : 'る'));
    return [wordSeg(dict.slice(0, -cut), dictReading?.slice(0, -cut)), { t: plainEnding }];
  }
  const adjEnding = ending === 'tara'
    ? (negative ? 'くなかったら' : 'かったら')
    : negative ? (past ? 'くなかった' : 'くない') : (past ? 'かった' : 'い');
  // Strip the adjective's final い; the ending supplies its own, and the polite form adds です.
  return [wordSeg(dict.slice(0, -1), dictReading?.slice(0, -1)), { t: ending === 'polite' ? `${adjEnding}です` : adjEnding }];
}
