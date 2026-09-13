import type { RubySegment } from '../../types.js';
import { toHiragana } from './toHiragana.js';

/**
 * A segment for one word: attach the furigana reading only when it differs from the surface. The
 * comparison folds katakana to hiragana first, so a katakana word (ネズミ) seeded with a redundant
 * hiragana reading (ねずみ) is recognised as the same word and takes no ruby — Japanese never
 * furiganas katakana. A kanji surface never folds to its all-kana reading, so it keeps its ruby.
 */
export function wordSeg(surface: string, reading?: string): RubySegment {
  return reading && toHiragana(reading) !== toHiragana(surface) ? { t: surface, r: reading } : { t: surface };
}
