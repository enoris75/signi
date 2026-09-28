import { describe, expect, test } from 'vitest';
import { cardinalPl } from './cardinalPl.js';
import type { Agr } from './pl.types.js';

const NV: Agr = { gender: 'masc', plural: true, virile: false, animate: true };
const F: Agr = { gender: 'fem', plural: true, virile: false, animate: false };
const VIR: Agr = { gender: 'masc', plural: true, virile: true, animate: true };

describe('cardinalPl', () => {
  test('2–4 over the nominative plural, 5 up over the genitive', () => {
    expect(cardinalPl(2, 'nom', NV)).toEqual({ word: 'dwa', nounCase: 'nom' });
    expect(cardinalPl(2, 'nom', F)).toEqual({ word: 'dwie', nounCase: 'nom' });
    expect(cardinalPl(5, 'acc', NV)).toEqual({ word: 'pięć', nounCase: 'gen' });
  });

  test('a virile noun takes the virile numeral and the genitive', () => {
    expect(cardinalPl(2, 'nom', VIR)).toEqual({ word: 'dwóch', nounCase: 'gen' });
  });

  test('the oblique cases decline the numeral', () => {
    expect(cardinalPl(2, 'ins', F)).toEqual({ word: 'dwiema', nounCase: 'ins' });
    expect(cardinalPl(3, 'dat', NV)).toEqual({ word: 'trzem', nounCase: 'dat' });
  });

  test('one agrees as an adjective', () => {
    expect(cardinalPl(1, 'acc', { gender: 'fem', plural: false, virile: false, animate: false }).word).toBe('jedną');
  });
});
