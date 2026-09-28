import { describe, expect, test } from 'vitest';
import { cardinalLt } from './cardinalLt.js';
import type { Agr } from './lt.types.js';

const MP: Agr = { gender: 'masc', plural: true };
const FP: Agr = { gender: 'fem', plural: true };

describe('cardinalLt', () => {
  test('two to nine agree and decline, the noun in the slot\'s case', () => {
    expect(cardinalLt(2, 'nom', MP)).toEqual({ word: 'du', nounCase: 'nom' });
    expect(cardinalLt(2, 'nom', FP)).toEqual({ word: 'dvi', nounCase: 'nom' });
    expect(cardinalLt(3, 'acc', FP)).toEqual({ word: 'tris', nounCase: 'acc' });
    expect(cardinalLt(4, 'acc', MP)).toEqual({ word: 'keturis', nounCase: 'acc' });
    expect(cardinalLt(5, 'ins', FP)).toEqual({ word: 'penkiomis', nounCase: 'ins' });
    expect(cardinalLt(2, 'ins', FP)).toEqual({ word: 'dviem', nounCase: 'ins' });
  });

  test('ten and up stand over a genitive plural', () => {
    expect(cardinalLt(10, 'nom', FP)).toEqual({ word: 'dešimt', nounCase: 'gen' });
    expect(cardinalLt(12, 'dat', MP)).toEqual({ word: 'dvylika', nounCase: 'gen' });
  });

  test('a compound counts by its last digit', () => {
    expect(cardinalLt(24, 'nom', FP)).toEqual({ word: 'dvidešimt keturios', nounCase: 'nom' });
  });

  test('one agrees as an adjective', () => {
    expect(cardinalLt(1, 'acc', { gender: 'fem', plural: false }).word).toBe('vieną');
    expect(cardinalLt(1, 'nom', { gender: 'masc', plural: false }).word).toBe('vienas');
  });
});
