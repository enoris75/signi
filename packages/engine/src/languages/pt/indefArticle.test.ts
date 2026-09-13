import { describe, expect, test } from 'vitest';
import { LIVRO, MULHER } from './pt.fixtures.js';
import { indefArticle } from './indefArticle.js';

describe('indefArticle', () => {
  test('um / uns for a masculine noun', () => {
    expect(indefArticle(LIVRO)).toBe('um');
    expect(indefArticle(LIVRO, true)).toBe('uns');
  });

  test('uma / umas for a feminine noun', () => {
    expect(indefArticle(MULHER)).toBe('uma');
    expect(indefArticle(MULHER, true)).toBe('umas');
  });

  test('defaults to the masculine without a gender', () => {
    expect(indefArticle({ base: 'x' })).toBe('um');
  });
});
