import { describe, expect, test } from 'vitest';
import { DIMENSIONE, el, np } from './it.fixtures.js';
import { isDimensionGloss } from './isDimensionGloss.js';

describe('isDimensionGloss', () => {
  test('a single conjunct flagged as a dimension gloss', () => {
    expect(isDimensionGloss(el(np(DIMENSIONE, {}, { dimensionGloss: true })))).toBe(true);
  });

  test('an unflagged or manner-flagged phrase is not', () => {
    expect(isDimensionGloss(el(np(DIMENSIONE)))).toBe(false);
    expect(isDimensionGloss(el(np(DIMENSIONE, {}, { mannerGloss: true })))).toBe(false);
  });

  test('a coordination is never a gloss', () => {
    const flagged = np(DIMENSIONE, {}, { dimensionGloss: true });
    expect(isDimensionGloss(el(flagged, flagged))).toBe(false);
  });
});
