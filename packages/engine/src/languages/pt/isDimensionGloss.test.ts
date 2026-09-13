import { describe, expect, test } from 'vitest';
import { isDimensionGloss } from './isDimensionGloss.js';
import { el, np, TAMANHO } from './pt.fixtures.js';

describe('isDimensionGloss', () => {
  test('is true for a single conjunct flagged as a dimension gloss', () => {
    expect(isDimensionGloss(el(np(TAMANHO, {}, { dimensionGloss: true })))).toBe(true);
  });

  test('is false for an unflagged phrase or a coordination', () => {
    expect(isDimensionGloss(el(np(TAMANHO)))).toBe(false);
    expect(isDimensionGloss(el(np(TAMANHO, {}, { dimensionGloss: true }), np(TAMANHO, {}, { dimensionGloss: true })))).toBe(false);
  });
});
