import { describe, expect, test } from 'vitest';
import { el, MODO, np } from './it.fixtures.js';
import { isMannerGloss } from './isMannerGloss.js';

describe('isMannerGloss', () => {
  test('a single conjunct flagged as a manner gloss', () => {
    expect(isMannerGloss(el(np(MODO, {}, { mannerGloss: true })))).toBe(true);
  });

  test('an unflagged or dimension-flagged phrase is not', () => {
    expect(isMannerGloss(el(np(MODO)))).toBe(false);
    expect(isMannerGloss(el(np(MODO, {}, { dimensionGloss: true })))).toBe(false);
  });

  test('a coordination is never a gloss', () => {
    const flagged = np(MODO, {}, { mannerGloss: true });
    expect(isMannerGloss(el(flagged, flagged))).toBe(false);
  });
});
