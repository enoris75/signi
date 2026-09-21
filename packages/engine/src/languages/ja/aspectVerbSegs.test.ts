import { describe, expect, test } from 'vitest';
import { AGERU, IKU, KURU, MOTSU, NOMU, OMOERU, SHIRU, TABERU, vp } from './ja.fixtures.js';

const TABENAI = { ...TABERU, nai: '食べない', nai_reading: 'たべない' };
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

  // B05: the resultative is a perfect. "Has eaten" is the past; every other cell is the resultant
  // state 〜ている, built as the progressive is.
  test('resultative: the present perfect is the past', () => {
    expect(text(aspectVerbSegs(vp(IKU, { aspect: 'resultative' }), false))).toBe('行きました');
    expect(aspectVerbSegs(vp(TABERU, { aspect: 'resultative' }), false)).toEqual([{ t: '食べました', r: 'たべました' }]);
    expect(aspectVerbSegs(vp(TABERU, { aspect: 'resultative' }), false, 'plain')).toEqual([{ t: '食べた', r: 'たべた' }]);
  });

  test('resultative: the negative, past and future perfect are the te-form + いる', () => {
    expect(text(aspectVerbSegs(vp(IKU, { aspect: 'resultative' }), true))).toBe('行っていません');
    expect(text(aspectVerbSegs(vp(IKU, { aspect: 'resultative', tense: 'future' }), false))).toBe('行っています');
    expect(text(aspectVerbSegs(vp(IKU, { aspect: 'resultative', tense: 'past' }), true))).toBe('行っていませんでした');
    expect(aspectVerbSegs(vp(TABERU, { aspect: 'resultative', tense: 'past' }), false)).toEqual([
      { t: '食べて', r: 'たべて' },
      { t: 'いました' },
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

  // B05: a state verb's perfect is its state (持っていました "has had"), and a verb whose negative is the
  // event's keeps it (知りません, never 知っていません).
  test('resultative: a state verb and an event negative', () => {
    expect(text(aspectVerbSegs(vp(MOTSU, { aspect: 'resultative' }), false))).toBe('持っていました');
    expect(text(aspectVerbSegs(vp(MOTSU, { aspect: 'resultative' }), false, 'plain'))).toBe('持っていた');
    expect(text(aspectVerbSegs(vp(MOTSU, { aspect: 'resultative' }), true))).toBe('持っていません');
    expect(text(aspectVerbSegs(vp(OMOERU, { aspect: 'resultative' }), false))).toBe('思えました');
    expect(text(aspectVerbSegs(vp(SHIRU, { aspect: 'resultative' }), true))).toBe('知りません');
    expect(text(aspectVerbSegs(vp(SHIRU, { aspect: 'resultative', tense: 'past' }), true))).toBe('知りませんでした');
    expect(text(aspectVerbSegs(vp(SHIRU, { aspect: 'resultative' }), true, 'plain'))).toBe('知らない');
    expect(text(aspectVerbSegs(vp(SHIRU, { aspect: 'resultative' }), true, 'tara'))).toBe('知らなかったら');
  });

  // A118: an "if" clause puts the aspect's fixed ending in the たら form.
  test('the たら form of each aspect, affirmative and negative', () => {
    expect(text(aspectVerbSegs(vp(TABERU, { aspect: 'progressive' }), false, 'tara'))).toBe('食べていたら');
    expect(text(aspectVerbSegs(vp(TABERU, { aspect: 'progressive' }), true, 'tara'))).toBe('食べていなかったら');
    expect(text(aspectVerbSegs(vp(TABERU, { aspect: 'resultative', tense: 'past' }), false, 'tara'))).toBe('食べていたら');
    expect(text(aspectVerbSegs(vp(TABERU, { aspect: 'resultative' }), false, 'tara'))).toBe('食べていたら');
    expect(text(aspectVerbSegs(vp(TABERU, { aspect: 'resultative' }), true, 'tara'))).toBe('食べていなかったら');
    expect(text(aspectVerbSegs(vp(TABERU, { aspect: 'prospective' }), false, 'tara'))).toBe('食べるところだったら');
    expect(text(aspectVerbSegs(vp(TABERU, { aspect: 'prospective' }), true, 'tara'))).toBe('食べるところではなかったら');
  });

  // B14: a prenominal relative clause closes on the plain form of the aspect.
  describe('the plain ending', () => {
    test('the progressive puts いる in the plain form, for tense and polarity', () => {
      expect(aspectVerbSegs(vp(TABERU, { aspect: 'progressive' }), false, 'plain')).toEqual([{ t: '食べて', r: 'たべて' }, { t: 'いる' }]);
      expect(text(aspectVerbSegs(vp(NOMU, { aspect: 'progressive', tense: 'past' }), false, 'plain'))).toBe('飲んでいた');
      expect(text(aspectVerbSegs(vp(TABERU, { aspect: 'progressive', tense: 'future' }), false, 'plain'))).toBe('食べている');
      expect(text(aspectVerbSegs(vp(TABERU, { aspect: 'progressive' }), true, 'plain'))).toBe('食べていない');
      expect(text(aspectVerbSegs(vp(IKU, { aspect: 'progressive', tense: 'past' }), true, 'plain'))).toBe('行っていなかった');
    });

    test('the resultative is the plain past, else the plain いる', () => {
      expect(text(aspectVerbSegs(vp(TABERU, { aspect: 'resultative' }), false, 'plain'))).toBe('食べた');
      expect(text(aspectVerbSegs(vp(TABERU, { aspect: 'resultative' }), true, 'plain'))).toBe('食べていない');
      expect(text(aspectVerbSegs(vp(TABERU, { aspect: 'resultative', tense: 'past' }), false, 'plain'))).toBe('食べていた');
      expect(text(aspectVerbSegs(vp(TABERU, { aspect: 'resultative', tense: 'past' }), true, 'plain'))).toBe('食べていなかった');
    });

    test('the prospective is 〜ようとしている on the volitional, inflecting as the progressive', () => {
      expect(aspectVerbSegs(vp(TABENAI, { aspect: 'prospective' }), false, 'plain')).toEqual([
        { t: '食べよう', r: 'たべよう' },
        { t: 'として' },
        { t: 'いる' },
      ]);
      expect(text(aspectVerbSegs(vp(TABENAI, { aspect: 'prospective', tense: 'past' }), false, 'plain'))).toBe('食べようとしていた');
      expect(text(aspectVerbSegs(vp(TABENAI, { aspect: 'prospective' }), true, 'plain'))).toBe('食べようとしていない');
      expect(text(aspectVerbSegs(vp({ ...KURU, nai: '来ない', nai_reading: 'こない' }, { aspect: 'prospective', tense: 'past' }), true, 'plain')))
        .toBe('来ようとしていなかった');
    });

    test('with no nai-form to build the volitional on, the prospective takes ところ and the plain copula', () => {
      expect(text(aspectVerbSegs(vp(TABERU, { aspect: 'prospective' }), false, 'plain'))).toBe('食べるところである');
      expect(text(aspectVerbSegs(vp(TABERU, { aspect: 'prospective', tense: 'past' }), true, 'plain'))).toBe('食べるところではなかった');
    });
  });
});
