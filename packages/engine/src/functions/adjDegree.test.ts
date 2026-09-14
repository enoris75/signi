import { describe, expect, test } from 'vitest';
import { adj } from '../languages/resolved.fixtures.js';
import { adjDegree } from './adjDegree.js';

const BIG = { base: 'big' };

describe('adjDegree', () => {
  test('reads the degree the translator threaded onto the forms', () => {
    expect(adjDegree(adj(BIG, { degree: 'more' }))).toBe('more');
    expect(adjDegree(adj(BIG, { degree: 'least' }))).toBe('least');
  });

  test('an adjective with no degree is the plain positive', () => {
    expect(adjDegree(adj(BIG))).toBe('positive');
  });
});
