import { describe, expect, test } from 'vitest';
import { isTableAdj, tableAdj } from './tableAdj.js';
import { DOBRY, TEN_SAM } from './pl.fixtures.js';

describe('tableAdj', () => {
  test('reads the stored column', () => {
    expect(tableAdj(TEN_SAM, 'nom', { gender: 'fem', plural: false, virile: false, animate: false })).toBe('ta sama');
    expect(tableAdj(TEN_SAM, 'acc', { gender: 'fem', plural: false, virile: false, animate: false })).toBe('tę samą');
    expect(tableAdj(TEN_SAM, 'gen', { gender: 'masc', plural: false, virile: false, animate: false })).toBe('tego samego');
    expect(tableAdj(TEN_SAM, 'nom', { gender: 'masc', plural: true, virile: true, animate: true })).toBe('ci sami');
  });

  test('the masculine animate accusative', () => {
    expect(tableAdj(TEN_SAM, 'acc', { gender: 'masc', plural: false, virile: false, animate: true })).toBe('tego samego');
  });

  test('tells a stored table from a declinable adjective', () => {
    expect(isTableAdj(TEN_SAM)).toBe(true);
    expect(isTableAdj(DOBRY)).toBe(false);
  });
});
