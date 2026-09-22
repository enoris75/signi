import { describe, expect, test } from 'vitest';
import { BUCH, el, ESSEN, np, vp } from './de.fixtures.js';
import { isRelativeGloss } from './isRelativeGloss.js';

const relative = { headRole: 'directObject' as const, verbPhrase: vp(ESSEN) };

describe('isRelativeGloss', () => {
  test('is true for a single conjunct flagged as a relative gloss that carries a relative', () => {
    expect(isRelativeGloss(el(np(BUCH, {}, { relative, relativeGloss: true })))).toBe(true);
  });

  test('is false when the flag is absent, false, or only another gloss', () => {
    expect(isRelativeGloss(el(np(BUCH, {}, { relative })))).toBe(false);
    expect(isRelativeGloss(el(np(BUCH, {}, { relative, relativeGloss: false })))).toBe(false);
    expect(isRelativeGloss(el(np(BUCH, {}, { relative, mannerGloss: true })))).toBe(false);
  });

  // The flag says "render the relative alone"; with no relative there is nothing to say, and the
  // phrase is the plain noun phrase it would be without the flag.
  test('is false for a flagged phrase with no relative', () => {
    expect(isRelativeGloss(el(np(BUCH, {}, { relativeGloss: true })))).toBe(false);
  });

  test('is false for a coordination, even of flagged conjuncts', () => {
    const flagged = np(BUCH, {}, { relative, relativeGloss: true });
    expect(isRelativeGloss(el(flagged, flagged))).toBe(false);
  });
});
