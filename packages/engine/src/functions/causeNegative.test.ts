import { describe, expect, test } from 'vitest';
import { complement, np } from '../languages/resolved.fixtures.js';
import { causeNegative } from './causeNegative.js';

const RAIN = { base: 'rain' };

describe('causeNegative', () => {
  test('reads the complement\'s own negation', () => {
    expect(causeNegative({ ...complement(np(RAIN)), negative: true })).toBe(true);
  });

  test('a complement that does not deny itself is positive', () => {
    expect(causeNegative(complement(np(RAIN)))).toBe(false);
    expect(causeNegative({ ...complement(np(RAIN)), negative: false })).toBe(false);
    expect(causeNegative(undefined)).toBe(false);
  });

  test('the sentiment is a separate choice', () => {
    const blamed = { ...complement(np(RAIN), [{ kind: 'sentiment' as const, value: 'negative' as const }]) };
    expect(causeNegative(blamed)).toBe(false);
    expect(causeNegative({ ...blamed, negative: true })).toBe(true);
  });
});
