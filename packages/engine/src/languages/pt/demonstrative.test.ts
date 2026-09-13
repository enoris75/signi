import { describe, expect, test } from 'vitest';
import { CASA, LIVRO } from './pt.fixtures.js';
import { demonstrative } from './demonstrative.js';

describe('demonstrative', () => {
  test('proximal "this" is este / esta / estes / estas', () => {
    expect(demonstrative(false, LIVRO)).toBe('este');
    expect(demonstrative(false, CASA)).toBe('esta');
    expect(demonstrative(false, LIVRO, true)).toBe('estes');
    expect(demonstrative(false, CASA, true)).toBe('estas');
  });

  // "that" maps to the medial esse, not the distal aquele.
  test('"that" is esse / essa / esses / essas', () => {
    expect(demonstrative(true, LIVRO)).toBe('esse');
    expect(demonstrative(true, CASA)).toBe('essa');
    expect(demonstrative(true, LIVRO, true)).toBe('esses');
    expect(demonstrative(true, CASA, true)).toBe('essas');
  });

  test('defaults to the masculine without a gender', () => {
    expect(demonstrative(false, { base: 'x' })).toBe('este');
  });
});
