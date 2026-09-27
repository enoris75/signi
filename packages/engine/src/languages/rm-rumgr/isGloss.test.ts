import { describe, expect, test } from 'vitest';
import { CHAUN, el, FORMAT, GIAT, MIEUR, MODA, np, vp, MANGIAR } from './rumgr.fixtures.js';
import { isDimensionGloss } from './isDimensionGloss.js';
import { isMannerGloss } from './isMannerGloss.js';
import { isRelativeGloss } from './isRelativeGloss.js';

// The three gloss flags, each true only on a single flagged conjunct.
describe('isDimensionGloss', () => {
  test('a single flagged conjunct', () => {
    expect(isDimensionGloss(el(np(FORMAT, {}, { dimensionGloss: true })))).toBe(true);
    expect(isDimensionGloss(el(np(FORMAT)))).toBe(false);
    expect(isDimensionGloss(el(np(FORMAT, {}, { dimensionGloss: true }), np(GIAT)))).toBe(false);
  });
});

describe('isMannerGloss', () => {
  test('a single flagged conjunct', () => {
    expect(isMannerGloss(el(np(MODA, {}, { mannerGloss: true })))).toBe(true);
    expect(isMannerGloss(el(np(MODA)))).toBe(false);
    expect(isMannerGloss(el(np(MODA, {}, { mannerGloss: true }), np(CHAUN)))).toBe(false);
  });
});

describe('isRelativeGloss', () => {
  const relative = { headRole: 'subject' as const, verbPhrase: vp(MANGIAR), directObject: el(np(MIEUR)) };
  test('a single flagged conjunct that carries a relative', () => {
    expect(isRelativeGloss(el(np(GIAT, {}, { relativeGloss: true, relative })))).toBe(true);
    expect(isRelativeGloss(el(np(GIAT, {}, { relativeGloss: true })))).toBe(false);
    expect(isRelativeGloss(el(np(GIAT, {}, { relative })))).toBe(false);
    expect(isRelativeGloss(el(np(GIAT, {}, { relativeGloss: true, relative }), np(CHAUN)))).toBe(false);
  });
});
