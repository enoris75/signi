import { describe, expect, test } from 'vitest';
import { complement, np } from '../languages/resolved.fixtures.js';
import { isPrivative } from './isPrivative.js';

const KNIFE = { base: 'knife' };

describe('isPrivative', () => {
  test('a denied instrument is the privative', () => {
    expect(isPrivative('instrumental', { ...complement(np(KNIFE)), negative: true })).toBe(true);
  });

  test('an instrument that is not denied is the plain means', () => {
    expect(isPrivative('instrumental', complement(np(KNIFE)))).toBe(false);
    expect(isPrivative('instrumental', undefined)).toBe(false);
  });

  // The denied cause is the other reading of the same flag, and it is not a privative.
  test('no other complement is one, denied or not', () => {
    expect(isPrivative('cause', { ...complement(np(KNIFE)), negative: true })).toBe(false);
    expect(isPrivative('comitative', { ...complement(np(KNIFE)), negative: true })).toBe(false);
  });
});
