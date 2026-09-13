import { describe, expect, test } from 'vitest';
import { adj, BEAUTIFUL, BIG, BROWN, CAT, np } from './en.fixtures.js';
import { npHasSuperlative } from './npHasSuperlative.js';

describe('npHasSuperlative', () => {
  test('most and least are superlatives', () => {
    expect(npHasSuperlative(np(CAT, {}, { adjectives: [adj(BIG, { degree: 'most' })] }))).toBe(true);
    expect(npHasSuperlative(np(CAT, {}, { adjectives: [adj(BIG, { degree: 'least' })] }))).toBe(true);
  });

  test('one superlative among several adjectives is enough', () => {
    expect(npHasSuperlative(np(CAT, {}, { adjectives: [adj(BEAUTIFUL, { degree: 'most' }), adj(BROWN)] }))).toBe(true);
  });

  test('comparatives, plain adjectives and a bare noun are not', () => {
    expect(npHasSuperlative(np(CAT, {}, { adjectives: [adj(BIG, { degree: 'more' })] }))).toBe(false);
    expect(npHasSuperlative(np(CAT, {}, { adjectives: [adj(BIG, { degree: 'less' }), adj(BROWN)] }))).toBe(false);
    expect(npHasSuperlative(np(CAT))).toBe(false);
  });
});
