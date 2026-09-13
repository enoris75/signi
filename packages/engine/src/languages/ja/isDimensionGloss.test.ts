import { describe, expect, test } from 'vitest';
import { el, np, OOKISA, SHITSU } from './ja.fixtures.js';
import { isDimensionGloss } from './isDimensionGloss.js';

describe('isDimensionGloss', () => {
  test('is true for a single conjunct flagged as a dimension gloss', () => {
    expect(isDimensionGloss(el(np(OOKISA, {}, { dimensionGloss: true })))).toBe(true);
  });

  test('is false when the flag is absent, false, or only a manner gloss', () => {
    expect(isDimensionGloss(el(np(OOKISA)))).toBe(false);
    expect(isDimensionGloss(el(np(OOKISA, {}, { dimensionGloss: false })))).toBe(false);
    expect(isDimensionGloss(el(np(OOKISA, {}, { mannerGloss: true })))).toBe(false);
  });

  test('is false for a coordination, even of flagged conjuncts', () => {
    const flagged = el(np(OOKISA, {}, { dimensionGloss: true }), np(SHITSU, {}, { dimensionGloss: true }));
    expect(isDimensionGloss(flagged)).toBe(false);
  });
});
