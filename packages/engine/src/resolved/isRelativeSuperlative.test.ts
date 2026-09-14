import { describe, expect, test } from 'vitest';
import { adj } from '../languages/resolved.fixtures.js';
import { isRelativeSuperlative } from './isRelativeSuperlative.js';

const BIG = { base: 'big' };

describe('isRelativeSuperlative', () => {
  // A26: the two superlatives share the comparative's degree adverb in Romance.
  test.each(['most', 'least'])('%s is a relative superlative', (degree) => {
    expect(isRelativeSuperlative(adj(BIG, { degree }))).toBe(true);
  });

  test.each(['more', 'less', 'equally', 'positive'])('%s is not', (degree) => {
    expect(isRelativeSuperlative(adj(BIG, { degree }))).toBe(false);
  });

  test('an adjective with no degree is not', () => {
    expect(isRelativeSuperlative(adj(BIG))).toBe(false);
  });
});
