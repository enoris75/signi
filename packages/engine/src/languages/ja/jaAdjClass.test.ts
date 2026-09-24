import { describe, expect, test } from 'vitest';
import { jaAdjClass } from './jaAdjClass.js';

describe('jaAdjClass', () => {
  test('an i-adjective drops its い', () => {
    expect(jaAdjClass('大きい', 'おおきい')).toEqual({ kind: 'i', stem: '大き', reading: 'おおき', attributive: '', predicative: '' });
  });

  test('a na-adjective and a の-adjective drop their particle and inflect through the copula', () => {
    expect(jaAdjClass('幸せな', 'しあわせな')).toEqual({ kind: 'na', stem: '幸せ', reading: 'しあわせ', attributive: 'な', predicative: '' });
    expect(jaAdjClass('茶色の', 'ちゃいろの')).toEqual({ kind: 'na', stem: '茶色', reading: 'ちゃいろ', attributive: 'の', predicative: '' });
  });

  test('a た-adjective builds on its te-form', () => {
    expect(jaAdjClass('疲れた', 'つかれた')).toEqual({ kind: 'ta', stem: '疲れて', reading: 'つかれて', attributive: '', predicative: '' });
    expect(jaAdjClass('孤立した')).toEqual({ kind: 'ta', stem: '孤立して', reading: undefined, attributive: '', predicative: '' });
    expect(jaAdjClass('死んだ')).toEqual({ kind: 'ta', stem: '死んで', reading: undefined, attributive: '', predicative: '' });
  });

  // Localization B87: a verb's word carries the row its class writes after the stem.
  test('a verb drops its last kana and says which row its endings build on', () => {
    expect(jaAdjClass('大きすぎる', 'おおきすぎる', false, true)).toEqual({
      kind: 'ru', stem: '大きすぎ', reading: 'おおきすぎ', attributive: '', predicative: '',
      verb: { u: 'る', i: '', a: '', te: 'て', ta: 'た' },
    });
    expect(jaAdjClass('違う', 'ちがう', false, true)).toEqual({
      kind: 'ru', stem: '違', reading: 'ちが', attributive: '', predicative: '',
      verb: { u: 'う', i: 'い', a: 'わ', te: 'って', ta: 'った' },
    });
    expect(jaAdjClass('実在する', 'じつざいする', false, true)).toEqual({
      kind: 'ru', stem: '実在', reading: 'じつざい', attributive: '', predicative: '',
      verb: { u: 'する', i: 'し', a: 'し', te: 'して', ta: 'した' },
    });
    expect(jaAdjClass('読む', undefined, false, true)).toMatchObject({ stem: '読', verb: { i: 'み', a: 'ま', te: 'んで', ta: 'んだ' } });
  });

  test('without the flag a verb-shaped base is not read as one', () => {
    expect(jaAdjClass('違う', 'ちがう')).toMatchObject({ kind: 'na', stem: '違う' });
    expect(jaAdjClass('違う', 'ちがう')).not.toHaveProperty('verb');
  });

  test('any other base is a na-adjective with nothing to drop', () => {
    expect(jaAdjClass('ゼロ')).toEqual({ kind: 'na', stem: 'ゼロ', reading: undefined, attributive: '', predicative: '' });
  });

  // A246. A relational の-adjective keeps its の in front of the copula, where dropping it would
  // predicate the thing the stem names (猫はアメリカです, "the cat is America").
  test('a relational の-adjective hands back the の the predicate keeps', () => {
    expect(jaAdjClass('アメリカの', undefined, true))
      .toEqual({ kind: 'na', stem: 'アメリカ', reading: undefined, attributive: 'の', predicative: 'の' });
  });

  test('the flag reaches only a の-adjective: a な one and the other classes keep nothing', () => {
    expect(jaAdjClass('幸せな', 'しあわせな', true))
      .toEqual({ kind: 'na', stem: '幸せ', reading: 'しあわせ', attributive: 'な', predicative: '' });
    expect(jaAdjClass('大きい', 'おおきい', true)).toMatchObject({ kind: 'i', predicative: '' });
    expect(jaAdjClass('疲れた', 'つかれた', true)).toMatchObject({ kind: 'ta', predicative: '' });
    expect(jaAdjClass('ゼロ', undefined, true)).toMatchObject({ kind: 'na', stem: 'ゼロ', predicative: '' });
  });
});
