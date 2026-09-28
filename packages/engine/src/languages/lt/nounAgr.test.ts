import { describe, expect, test } from 'vitest';
import { nounAgr } from './nounAgr.js';
import { KATE, MOKYTOJAS, NAMAS, PINIGAI } from './lt.fixtures.js';

describe('nounAgr', () => {
  test('gender and number', () => {
    expect(nounAgr({ ...KATE, number: 'plural' })).toEqual({ gender: 'fem', plural: true });
    expect(nounAgr(NAMAS)).toEqual({ gender: 'masc', plural: false });
  });

  test('a plurale tantum agrees as a plural', () => {
    expect(nounAgr({ ...PINIGAI, number: 'singular' })).toEqual({ gender: 'masc', plural: true });
  });

  test('the feminine variant agrees as a feminine', () => {
    expect(nounAgr({ ...MOKYTOJAS, gender: 'fem' }).gender).toBe('fem');
  });

  test('no gender is masculine; there is no neuter noun', () => {
    expect(nounAgr({ base: 'kažkas' }).gender).toBe('masc');
    expect(nounAgr({ base: 'x', gender: 'neut' }).gender).toBe('masc');
  });
});
