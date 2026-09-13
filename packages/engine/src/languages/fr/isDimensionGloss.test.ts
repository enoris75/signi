import { describe, expect, test } from 'vitest';
import { el, np, QUALITE, TAILLE } from './fr.fixtures.js';
import { isDimensionGloss } from './isDimensionGloss.js';

describe('isDimensionGloss', () => {
  test('is true for a single conjunct flagged as a dimension gloss', () => {
    expect(isDimensionGloss(el(np(TAILLE, {}, { dimensionGloss: true })))).toBe(true);
  });

  test('is false when the flag is absent, false, or only a manner gloss', () => {
    expect(isDimensionGloss(el(np(TAILLE)))).toBe(false);
    expect(isDimensionGloss(el(np(TAILLE, {}, { dimensionGloss: false })))).toBe(false);
    expect(isDimensionGloss(el(np(TAILLE, {}, { mannerGloss: true })))).toBe(false);
  });

  test('is false for a coordination, even of flagged conjuncts', () => {
    const flagged = el(np(TAILLE, {}, { dimensionGloss: true }), np(QUALITE, {}, { dimensionGloss: true }));
    expect(isDimensionGloss(flagged)).toBe(false);
  });
});
