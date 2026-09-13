import { describe, expect, test } from 'vitest';
import { AFRICA, AGUA, ANTARTIDA, CASA, GATO } from './es.fixtures.js';
import { datPrep } from './datPrep.js';

describe('datPrep', () => {
  test('a + el contracts to al', () => {
    expect(datPrep(GATO)).toBe('al');
    expect(datPrep(AGUA)).toBe('al');
  });

  test('the other articles stay apart', () => {
    expect(datPrep(CASA)).toBe('a la');
    expect(datPrep(GATO, true)).toBe('a los');
    expect(datPrep(CASA, true)).toBe('a las');
  });

  test('a bare proper name takes plain a; an articled one a la', () => {
    expect(datPrep(AFRICA)).toBe('a');
    expect(datPrep(ANTARTIDA)).toBe('a la');
  });
});
