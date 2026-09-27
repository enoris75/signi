import { describe, expect, test } from 'vitest';
import { el, GAT, MENJAR, np, vp } from './ca.fixtures.js';
import { isRelativeGloss } from './isRelativeGloss.js';

const eats = { headRole: 'subject' as const, verbPhrase: vp(MENJAR) };

describe('isRelativeGloss', () => {
  test('a flagged conjunct with a relative is one', () => {
    expect(isRelativeGloss(el(np(GAT, {}, { relativeGloss: true, relative: eats })))).toBe(true);
  });

  test('a flag without a relative, or no flag, is not', () => {
    expect(isRelativeGloss(el(np(GAT, {}, { relativeGloss: true })))).toBe(false);
    expect(isRelativeGloss(el(np(GAT, {}, { relative: eats })))).toBe(false);
  });
});
