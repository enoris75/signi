import { describe, expect, test } from 'vitest';
import { adj, BIG, BROWN, CAT, LAZY, np } from './en.fixtures.js';
import { npAdj } from './npAdj.js';

describe('npAdj', () => {
  test('joins the adjectives in order, each at its own degree', () => {
    expect(npAdj(np(CAT, {}, { adjectives: [adj(BIG, { degree: 'more' }), adj(BROWN)] }))).toBe('bigger brown');
  });

  test('a phrase with no adjectives gives an empty string', () => {
    expect(npAdj(np(CAT))).toBe('');
  });

  test('skips an adjective with no English base', () => {
    expect(npAdj(np(CAT, {}, { adjectives: [adj({ role: 'adjective' }), adj(LAZY)] }))).toBe('lazy');
  });
});
