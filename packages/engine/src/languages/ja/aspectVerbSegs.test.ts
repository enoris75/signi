import { describe, expect, test } from 'vitest';
import { AGERU, IKU, KURU, NOMU, TABERU, vp } from './ja.fixtures.js';
import { aspectVerbSegs } from './aspectVerbSegs.js';

const text = (segs: { t: string }[]) => segs.map((s) => s.t).join('');

describe('aspectVerbSegs', () => {
  test('progressive: the te-form + います, the te-form keeping its reading', () => {
    expect(aspectVerbSegs(vp(TABERU, { aspect: 'progressive' }), false)).toEqual([
      { t: '食べて', r: 'たべて' },
      { t: 'います' },
    ]);
    expect(text(aspectVerbSegs(vp(NOMU, { aspect: 'progressive', tense: 'past' }), false))).toBe('飲んでいました');
  });

  test('progressive negates on the auxiliary', () => {
    expect(text(aspectVerbSegs(vp(TABERU, { aspect: 'progressive' }), true))).toBe('食べていません');
    expect(text(aspectVerbSegs(vp(IKU, { aspect: 'progressive', tense: 'past' }), true))).toBe('行っていませんでした');
  });

  test('the future reuses the present', () => {
    expect(text(aspectVerbSegs(vp(TABERU, { aspect: 'progressive', tense: 'future' }), false))).toBe('食べています');
  });

  // The resultative is rendered as the completive 〜てしまう (B5).
  test('resultative: the te-form + しまいます', () => {
    expect(text(aspectVerbSegs(vp(IKU, { aspect: 'resultative' }), false))).toBe('行ってしまいます');
    expect(aspectVerbSegs(vp(TABERU, { aspect: 'resultative', tense: 'past' }), false)).toEqual([
      { t: '食べて', r: 'たべて' },
      { t: 'しまいました' },
    ]);
  });

  test('prospective: the dictionary form + ところです', () => {
    expect(aspectVerbSegs(vp(TABERU, { aspect: 'prospective' }), false)).toEqual([
      { t: '食べる', r: 'たべる' },
      { t: 'ところ' },
      { t: 'です' },
    ]);
    expect(text(aspectVerbSegs(vp(KURU, { aspect: 'prospective', tense: 'past' }), false))).toBe('来るところでした');
  });

  // The copula carries the prospective's polarity (A12).
  test('prospective negates on the copula', () => {
    expect(text(aspectVerbSegs(vp(TABERU, { aspect: 'prospective' }), true))).toBe('食べるところではありません');
    expect(text(aspectVerbSegs(vp(TABERU, { aspect: 'prospective', tense: 'past' }), true))).toBe('食べるところではありませんでした');
  });

  test('a kana te-form takes no ruby', () => {
    expect(aspectVerbSegs(vp(AGERU, { aspect: 'progressive' }), false)).toEqual([{ t: 'あげて' }, { t: 'います' }]);
  });
});
