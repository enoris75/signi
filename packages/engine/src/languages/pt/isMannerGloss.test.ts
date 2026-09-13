import { describe, expect, test } from 'vitest';
import { isMannerGloss } from './isMannerGloss.js';
import { el, np, VELOCIDADE } from './pt.fixtures.js';

describe('isMannerGloss', () => {
  test('is true for a single conjunct flagged as a manner gloss', () => {
    expect(isMannerGloss(el(np(VELOCIDADE, {}, { mannerGloss: true })))).toBe(true);
  });

  test('is false for an unflagged phrase or a coordination', () => {
    expect(isMannerGloss(el(np(VELOCIDADE)))).toBe(false);
    expect(isMannerGloss(el(np(VELOCIDADE, {}, { mannerGloss: true }), np(VELOCIDADE, {}, { mannerGloss: true })))).toBe(false);
  });
});
