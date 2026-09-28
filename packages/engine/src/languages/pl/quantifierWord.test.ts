import { describe, expect, test } from 'vitest';
import { quantifierWord } from './quantifierWord.js';
import type { Agr } from './pl.types.js';

const NV: Agr = { gender: 'masc', plural: true, virile: false, animate: true };
const VIR: Agr = { gender: 'masc', plural: true, virile: true, animate: true };

describe('quantifierWord', () => {
  test('the nominative and accusative govern the genitive', () => {
    expect(quantifierWord('many', 'nom', NV, false)).toEqual({ word: 'wiele', nounCase: 'gen' });
    expect(quantifierWord('many', 'nom', VIR, false)).toEqual({ word: 'wielu', nounCase: 'gen' });
    expect(quantifierWord('some', 'acc', NV, false)).toEqual({ word: 'kilka', nounCase: 'gen' });
    expect(quantifierWord('few', 'nom', NV, false)).toEqual({ word: 'mało', nounCase: 'gen' });
  });

  test('the oblique cases decline the quantifier and keep the noun\'s case', () => {
    expect(quantifierWord('some', 'ins', NV, false)).toEqual({ word: 'kilkoma', nounCase: 'ins' });
    expect(quantifierWord('many', 'gen', NV, false)).toEqual({ word: 'wielu', nounCase: 'gen' });
  });

  test('a mass noun takes the mass word', () => {
    expect(quantifierWord('some', 'nom', NV, true)).toEqual({ word: 'trochę', nounCase: 'gen' });
    expect(quantifierWord('many', 'acc', NV, true)).toEqual({ word: 'dużo', nounCase: 'gen' });
  });

  test('większość declines over a genitive', () => {
    expect(quantifierWord('most', 'ins', NV, false)).toEqual({ word: 'większością', nounCase: 'gen' });
  });

  test('no quantifier', () => {
    expect(quantifierWord('this', 'nom', NV, false)).toBeUndefined();
  });
});
