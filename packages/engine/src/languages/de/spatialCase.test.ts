import { describe, expect, test } from 'vitest';
import { spatialCase } from './spatialCase.js';

describe('spatialCase', () => {
  test('durch and um govern the accusative, for a route and a locative', () => {
    for (const type of ['route', 'locative'] as const) {
      expect(spatialCase('through', type)).toBe('acc');
      expect(spatialCase('around', type)).toBe('acc');
    }
  });

  test('the two-way prepositions take the static dative in a locative', () => {
    for (const spec of ['in', 'under', 'over', 'behind', 'in_front_of'] as const) {
      expect(spatialCase(spec, 'locative')).toBe('dat');
    }
  });

  test('a route keeps the dative, except over, which crosses its landmark in the accusative', () => {
    for (const spec of ['in', 'under', 'behind', 'in_front_of'] as const) {
      expect(spatialCase(spec, 'route')).toBe('dat');
    }
    expect(spatialCase('over', 'route')).toBe('acc');
  });
});
