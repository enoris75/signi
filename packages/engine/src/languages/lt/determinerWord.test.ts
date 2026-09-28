import { describe, expect, test } from 'vitest';
import { determinerWord } from './determinerWord.js';
import type { Agr } from './lt.types.js';

const F: Agr = { gender: 'fem', plural: false };
const M: Agr = { gender: 'masc', plural: false };
const MP: Agr = { gender: 'masc', plural: true };
const FP: Agr = { gender: 'fem', plural: true };

describe('determinerWord', () => {
  test('no articles', () => {
    expect(['definite', 'indefinite', 'bare', undefined].map((d) => determinerWord(d, 'nom', F))).toEqual(['', '', '', '']);
  });

  test('šis / tas agree and decline', () => {
    expect(determinerWord('this', 'nom', F)).toBe('ši');
    expect(determinerWord('this', 'acc', M)).toBe('šį');
    expect(determinerWord('that', 'nom', MP)).toBe('tie');
    expect(determinerWord('that', 'dat', FP)).toBe('toms');
  });

  test('visi / visos, visas over a singular', () => {
    expect(determinerWord('all', 'nom', MP)).toBe('visi');
    expect(determinerWord('all', 'nom', FP)).toBe('visos');
    expect(determinerWord('all', 'nom', M)).toBe('visas');
  });

  test('joks, keli, abu, kiekvienas', () => {
    expect(determinerWord('no', 'nom', F)).toBe('jokia');
    expect(determinerWord('no', 'gen', F)).toBe('jokios');
    expect(determinerWord('some', 'acc', MP)).toBe('kelis');
    expect(determinerWord('some', 'nom', FP)).toBe('kelios');
    expect(determinerWord('both', 'nom', FP)).toBe('abi');
    expect(determinerWord('every', 'dat', M)).toBe('kiekvienam');
  });
});
