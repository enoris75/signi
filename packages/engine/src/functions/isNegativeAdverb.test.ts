import { describe, expect, test } from 'vitest';
import { concept } from '../languages/resolved.fixtures.js';
import { isNegativeAdverb } from './isNegativeAdverb.js';

describe('isNegativeAdverb', () => {
  test('an adverb of negative polarity', () => {
    expect(isNegativeAdverb(concept({ base: 'never', polarity: 'negative' }))).toBe(true);
  });

  test('any other adverb, or no adverb at all', () => {
    expect(isNegativeAdverb(concept({ base: 'always' }))).toBe(false);
    expect(isNegativeAdverb(undefined)).toBe(false);
  });
});
