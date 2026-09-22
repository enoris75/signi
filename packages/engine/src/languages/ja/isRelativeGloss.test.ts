import { describe, expect, test } from 'vitest';
import { el, HON, np, TABERU, vp } from './ja.fixtures.js';
import { isRelativeGloss } from './isRelativeGloss.js';

const relative = { headRole: 'directObject' as const, verbPhrase: vp(TABERU) };

describe('isRelativeGloss', () => {
  test('is true for a single conjunct flagged as a relative gloss that carries a relative', () => {
    expect(isRelativeGloss(el(np(HON, {}, { relative, relativeGloss: true })))).toBe(true);
  });

  test('is false when the flag is absent, false, or only another gloss', () => {
    expect(isRelativeGloss(el(np(HON, {}, { relative })))).toBe(false);
    expect(isRelativeGloss(el(np(HON, {}, { relative, relativeGloss: false })))).toBe(false);
    expect(isRelativeGloss(el(np(HON, {}, { relative, mannerGloss: true })))).toBe(false);
  });

  // The flag says "render the relative alone"; with no relative there is nothing to say, and the
  // phrase is the plain noun phrase it would be without the flag.
  test('is false for a flagged phrase with no relative', () => {
    expect(isRelativeGloss(el(np(HON, {}, { relativeGloss: true })))).toBe(false);
  });

  test('is false for a coordination, even of flagged conjuncts', () => {
    const flagged = np(HON, {}, { relative, relativeGloss: true });
    expect(isRelativeGloss(el(flagged, flagged))).toBe(false);
  });
});
