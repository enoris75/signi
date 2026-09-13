import { describe, expect, test } from 'vitest';
import { AFRICA, AGUA, ANTARTIDA, CASA, GATO } from './es.fixtures.js';
import { dePrep } from './dePrep.js';

describe('dePrep', () => {
  test('de + el contracts to del', () => {
    expect(dePrep(GATO)).toBe('del');
    expect(dePrep(AGUA)).toBe('del');
  });

  test('the other articles stay apart', () => {
    expect(dePrep(CASA)).toBe('de la');
    expect(dePrep(GATO, true)).toBe('de los');
    expect(dePrep(CASA, true)).toBe('de las');
  });

  test('a bare proper name takes plain de; an articled one de la', () => {
    expect(dePrep(AFRICA)).toBe('de');
    expect(dePrep(ANTARTIDA)).toBe('de la');
  });
});
