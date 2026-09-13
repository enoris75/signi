import { describe, expect, test } from 'vitest';
import { el, np, QUALITY, SIZE } from './en.fixtures.js';
import { isDimensionGloss } from './isDimensionGloss.js';

describe('isDimensionGloss', () => {
  test('is true for a single conjunct flagged as a dimension gloss', () => {
    expect(isDimensionGloss(el(np(SIZE, {}, { dimensionGloss: true })))).toBe(true);
  });

  test('is false when the flag is absent, false, or only a manner gloss', () => {
    expect(isDimensionGloss(el(np(SIZE)))).toBe(false);
    expect(isDimensionGloss(el(np(SIZE, {}, { dimensionGloss: false })))).toBe(false);
    expect(isDimensionGloss(el(np(SIZE, {}, { mannerGloss: true })))).toBe(false);
  });

  test('is false for a coordination, even of flagged conjuncts', () => {
    const flagged = el(np(SIZE, {}, { dimensionGloss: true }), np(QUALITY, {}, { dimensionGloss: true }));
    expect(isDimensionGloss(flagged)).toBe(false);
  });
});
