import { describe, expect, test } from 'vitest';
import { determinerWord } from './determinerWord.js';
import type { Agr } from './pl.types.js';

const F: Agr = { gender: 'fem', plural: false, virile: false, animate: false };
const MA: Agr = { gender: 'masc', plural: false, virile: false, animate: true };
const VIR: Agr = { gender: 'masc', plural: true, virile: true, animate: true };
const NV: Agr = { gender: 'masc', plural: true, virile: false, animate: true };

describe('determinerWord', () => {
  test('no articles', () => {
    expect(['definite', 'indefinite', 'bare', undefined].map((d) => determinerWord(d, 'nom', F))).toEqual(['', '', '', '']);
  });

  test('ten / tamten agree and decline', () => {
    expect(determinerWord('this', 'nom', F)).toBe('ta');
    expect(determinerWord('this', 'acc', MA)).toBe('tego');
    expect(determinerWord('that', 'nom', VIR)).toBe('tamci');
  });

  test('wszyscy / wszystkie, cały over a singular', () => {
    expect(determinerWord('all', 'nom', VIR)).toBe('wszyscy');
    expect(determinerWord('all', 'nom', NV)).toBe('wszystkie');
    expect(determinerWord('all', 'nom', F)).toBe('cała');
  });

  test('żaden, każdy, oba', () => {
    expect(determinerWord('no', 'gen', F)).toBe('żadnej');
    expect(determinerWord('every', 'dat', MA)).toBe('każdemu');
    expect(determinerWord('both', 'nom', VIR)).toBe('obaj');
  });
});
