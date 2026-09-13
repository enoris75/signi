import { describe, expect, test } from 'vitest';
import { el, MANIERE, np, VITESSE } from './fr.fixtures.js';
import { isMannerGloss } from './isMannerGloss.js';

describe('isMannerGloss', () => {
  test('is true for a single conjunct flagged as a manner gloss', () => {
    expect(isMannerGloss(el(np(VITESSE, {}, { mannerGloss: true })))).toBe(true);
  });

  test('is false when the flag is absent, false, or only a dimension gloss', () => {
    expect(isMannerGloss(el(np(VITESSE)))).toBe(false);
    expect(isMannerGloss(el(np(VITESSE, {}, { mannerGloss: false })))).toBe(false);
    expect(isMannerGloss(el(np(VITESSE, {}, { dimensionGloss: true })))).toBe(false);
  });

  test('is false for a coordination, even of flagged conjuncts', () => {
    const flagged = el(np(VITESSE, {}, { mannerGloss: true }), np(MANIERE, {}, { mannerGloss: true }));
    expect(isMannerGloss(flagged)).toBe(false);
  });
});
