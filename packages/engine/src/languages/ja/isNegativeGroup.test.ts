import { describe, expect, test } from 'vitest';
import { el, group, INU, NEKO, NEZUMI, np } from './ja.fixtures.js';
import { isNegativeGroup } from './isNegativeGroup.js';

describe('isNegativeGroup', () => {
  test('is true for a no-determined phrase', () => {
    expect(isNegativeGroup(el(np(NEKO, { definiteness: 'no' })))).toBe(true);
  });

  test('is false for every other determiner', () => {
    expect(isNegativeGroup(el(np(NEKO)))).toBe(false);
    for (const definiteness of ['definite', 'indefinite', 'bare', 'this', 'that', 'some', 'many', 'few', 'all']) {
      expect(isNegativeGroup(el(np(NEKO, { definiteness })))).toBe(false);
    }
  });

  test('is true when any conjunct of a coordination is no-determined', () => {
    expect(isNegativeGroup(el(np(NEKO), np(INU, { definiteness: 'no' })))).toBe(true);
    expect(isNegativeGroup(group('or', np(NEKO, { definiteness: 'no' }), np(NEZUMI)))).toBe(true);
    expect(isNegativeGroup(el(np(NEKO), np(INU), np(NEZUMI)))).toBe(false);
  });
});
