import { describe, expect, test } from 'vitest';
import { spatialCase } from './spatialCase.js';

describe('spatialCase', () => {
  test('durch and um govern the accusative', () => {
    expect(spatialCase('through')).toBe('acc');
    expect(spatialCase('around')).toBe('acc');
  });

  test('the two-way prepositions take the static dative', () => {
    for (const spec of ['in', 'under', 'over', 'behind', 'in_front_of'] as const) {
      expect(spatialCase(spec)).toBe('dat');
    }
  });
});
