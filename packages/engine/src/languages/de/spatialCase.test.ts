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

// P09-E1: auf, zwischen and an are two-way prepositions and follow the rule unchanged.
describe('spatialCase: on, between, against', () => {
  test('dative under a locative and a route, accusative under a direction', () => {
    for (const spec of ['on', 'between', 'against'] as const) {
      expect(spatialCase(spec, 'locative')).toBe('dat');
      expect(spatialCase(spec, 'route')).toBe('dat');
      expect(spatialCase(spec, 'direction')).toBe('acc');
    }
  });
});

// P09-E32: `among`'s zwischen is two-way, as between's.
describe('spatialCase: among', () => {
  test('dative for a place and a path, accusative for a goal', () => {
    expect(spatialCase('among', 'locative')).toBe('dat');
    expect(spatialCase('among', 'route')).toBe('dat');
    expect(spatialCase('among', 'direction')).toBe('acc');
  });
});
