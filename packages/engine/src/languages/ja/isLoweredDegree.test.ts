import { describe, expect, test } from 'vitest';
import { adj, OOKII } from './ja.fixtures.js';
import { isLoweredDegree } from './isLoweredDegree.js';

describe('isLoweredDegree', () => {
  test('is true for the lowered degrees less and least', () => {
    expect(isLoweredDegree(adj(OOKII, { degree: 'less' }))).toBe(true);
    expect(isLoweredDegree(adj(OOKII, { degree: 'least' }))).toBe(true);
  });

  test('is false for the raised, equal and plain degrees', () => {
    expect(isLoweredDegree(adj(OOKII, { degree: 'more' }))).toBe(false);
    expect(isLoweredDegree(adj(OOKII, { degree: 'most' }))).toBe(false);
    expect(isLoweredDegree(adj(OOKII, { degree: 'equally' }))).toBe(false);
    expect(isLoweredDegree(adj(OOKII))).toBe(false);
  });
});
