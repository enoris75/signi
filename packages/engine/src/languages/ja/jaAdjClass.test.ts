import { describe, expect, test } from 'vitest';
import { jaAdjClass } from './jaAdjClass.js';

describe('jaAdjClass', () => {
  test('an i-adjective drops its い', () => {
    expect(jaAdjClass('大きい', 'おおきい')).toEqual({ kind: 'i', stem: '大き', reading: 'おおき', attributive: '' });
  });

  test('a na-adjective and a の-adjective drop their particle and inflect through the copula', () => {
    expect(jaAdjClass('幸せな', 'しあわせな')).toEqual({ kind: 'na', stem: '幸せ', reading: 'しあわせ', attributive: 'な' });
    expect(jaAdjClass('茶色の', 'ちゃいろの')).toEqual({ kind: 'na', stem: '茶色', reading: 'ちゃいろ', attributive: 'の' });
  });

  test('a た-adjective builds on its te-form', () => {
    expect(jaAdjClass('疲れた', 'つかれた')).toEqual({ kind: 'ta', stem: '疲れて', reading: 'つかれて', attributive: '' });
    expect(jaAdjClass('孤立した')).toEqual({ kind: 'ta', stem: '孤立して', reading: undefined, attributive: '' });
    expect(jaAdjClass('死んだ')).toEqual({ kind: 'ta', stem: '死んで', reading: undefined, attributive: '' });
  });

  test('any other base is a na-adjective with nothing to drop', () => {
    expect(jaAdjClass('ゼロ')).toEqual({ kind: 'na', stem: 'ゼロ', reading: undefined, attributive: '' });
  });
});
