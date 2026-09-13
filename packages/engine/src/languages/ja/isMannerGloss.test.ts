import { describe, expect, test } from 'vitest';
import { el, HAYASA, HOUHOU, np } from './ja.fixtures.js';
import { isMannerGloss } from './isMannerGloss.js';

describe('isMannerGloss', () => {
  test('is true for a single conjunct flagged as a manner gloss', () => {
    expect(isMannerGloss(el(np(HAYASA, {}, { mannerGloss: true })))).toBe(true);
  });

  test('is false when the flag is absent, false, or only a dimension gloss', () => {
    expect(isMannerGloss(el(np(HAYASA)))).toBe(false);
    expect(isMannerGloss(el(np(HAYASA, {}, { mannerGloss: false })))).toBe(false);
    expect(isMannerGloss(el(np(HAYASA, {}, { dimensionGloss: true })))).toBe(false);
  });

  test('is false for a coordination, even of flagged conjuncts', () => {
    const flagged = el(np(HAYASA, {}, { mannerGloss: true }), np(HOUHOU, {}, { mannerGloss: true }));
    expect(isMannerGloss(flagged)).toBe(false);
  });
});
