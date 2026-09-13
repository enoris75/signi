import { describe, expect, test } from 'vitest';
import { el, GESCHWINDIGKEIT, np, WEISE } from './de.fixtures.js';
import { isMannerGloss } from './isMannerGloss.js';

describe('isMannerGloss', () => {
  test('is true for a single conjunct flagged as a manner gloss', () => {
    expect(isMannerGloss(el(np(GESCHWINDIGKEIT, {}, { mannerGloss: true })))).toBe(true);
  });

  test('is false when the flag is absent, false, or only a dimension gloss', () => {
    expect(isMannerGloss(el(np(GESCHWINDIGKEIT)))).toBe(false);
    expect(isMannerGloss(el(np(GESCHWINDIGKEIT, {}, { mannerGloss: false })))).toBe(false);
    expect(isMannerGloss(el(np(GESCHWINDIGKEIT, {}, { dimensionGloss: true })))).toBe(false);
  });

  test('is false for a coordination, even of flagged conjuncts', () => {
    const flagged = el(np(GESCHWINDIGKEIT, {}, { mannerGloss: true }), np(WEISE, {}, { mannerGloss: true }));
    expect(isMannerGloss(flagged)).toBe(false);
  });
});
