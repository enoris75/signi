import { describe, expect, test } from 'vitest';
import { el, np, SPEED, WAY } from './en.fixtures.js';
import { isMannerGloss } from './isMannerGloss.js';

describe('isMannerGloss', () => {
  test('is true for a single conjunct flagged as a manner gloss', () => {
    expect(isMannerGloss(el(np(SPEED, {}, { mannerGloss: true })))).toBe(true);
  });

  test('is false when the flag is absent, false, or only a dimension gloss', () => {
    expect(isMannerGloss(el(np(SPEED)))).toBe(false);
    expect(isMannerGloss(el(np(SPEED, {}, { mannerGloss: false })))).toBe(false);
    expect(isMannerGloss(el(np(SPEED, {}, { dimensionGloss: true })))).toBe(false);
  });

  test('is false for a coordination, even of flagged conjuncts', () => {
    const flagged = el(np(SPEED, {}, { mannerGloss: true }), np(WAY, {}, { mannerGloss: true }));
    expect(isMannerGloss(flagged)).toBe(false);
  });
});
