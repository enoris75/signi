import { describe, expect, test } from 'vitest';
import { el, GROESSE, np, QUALITAET } from './de.fixtures.js';
import { isDimensionGloss } from './isDimensionGloss.js';

describe('isDimensionGloss', () => {
  test('is true for a single conjunct flagged as a dimension gloss', () => {
    expect(isDimensionGloss(el(np(GROESSE, {}, { dimensionGloss: true })))).toBe(true);
  });

  test('is false when the flag is absent, false, or only a manner gloss', () => {
    expect(isDimensionGloss(el(np(GROESSE)))).toBe(false);
    expect(isDimensionGloss(el(np(GROESSE, {}, { dimensionGloss: false })))).toBe(false);
    expect(isDimensionGloss(el(np(GROESSE, {}, { mannerGloss: true })))).toBe(false);
  });

  test('is false for a coordination, even of flagged conjuncts', () => {
    const flagged = el(np(GROESSE, {}, { dimensionGloss: true }), np(QUALITAET, {}, { dimensionGloss: true }));
    expect(isDimensionGloss(flagged)).toBe(false);
  });
});
