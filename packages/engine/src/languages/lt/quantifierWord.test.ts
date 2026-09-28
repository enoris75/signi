import { describe, expect, test } from 'vitest';
import { quantifierWord } from './quantifierWord.js';

describe('quantifierWord', () => {
  test('daug / mažai over the genitive, in every case', () => {
    expect(quantifierWord('many', 'nom', false)).toEqual({ word: 'daug', nounCase: 'gen' });
    expect(quantifierWord('few', 'acc', false)).toEqual({ word: 'mažai', nounCase: 'gen' });
    expect(quantifierWord('many', 'ins', false)).toEqual({ word: 'daug', nounCase: 'gen' });
  });

  test('some over a mass noun is šiek tiek; over a count noun it is no such word', () => {
    expect(quantifierWord('some', 'nom', true)).toEqual({ word: 'šiek tiek', nounCase: 'gen' });
    expect(quantifierWord('some', 'nom', false)).toBeUndefined();
  });

  test('dauguma declines over a genitive', () => {
    expect(quantifierWord('most', 'ins', false)).toEqual({ word: 'dauguma', nounCase: 'gen' });
    expect(quantifierWord('most', 'loc', false)).toEqual({ word: 'daugumoje', nounCase: 'gen' });
  });

  test('no quantifier', () => {
    expect(quantifierWord('this', 'nom', false)).toBeUndefined();
  });
});
