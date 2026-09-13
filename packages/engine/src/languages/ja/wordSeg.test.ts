import { describe, expect, test } from 'vitest';
import { wordSeg } from './wordSeg.js';

describe('wordSeg', () => {
  test('attaches a reading that differs from the surface', () => {
    expect(wordSeg('猫', 'ねこ')).toEqual({ t: '猫', r: 'ねこ' });
    expect(wordSeg('食べます', 'たべます')).toEqual({ t: '食べます', r: 'たべます' });
  });

  test('takes no ruby without a reading', () => {
    expect(wordSeg('いつも')).toEqual({ t: 'いつも' });
    expect(wordSeg('キツネ', '')).toEqual({ t: 'キツネ' });
  });

  test('takes no ruby when the reading only repeats the kana surface', () => {
    expect(wordSeg('なる', 'なる')).toEqual({ t: 'なる' });
  });

  test('never furiganas a katakana word seeded with a hiragana reading', () => {
    expect(wordSeg('ネズミ', 'ねずみ')).toEqual({ t: 'ネズミ' });
    expect(wordSeg('フレーズ', 'ふれーず')).toEqual({ t: 'フレーズ' });
  });

  test('keeps whole-word ruby over a katakana-kanji compound', () => {
    expect(wordSeg('イタリア語', 'いたりあご')).toEqual({ t: 'イタリア語', r: 'いたりあご' });
  });
});
