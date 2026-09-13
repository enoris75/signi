import { describe, expect, test } from 'vitest';
import { CASA, GATO } from './pt.fixtures.js';
import { defArticle } from './defArticle.js';

describe('defArticle', () => {
  test('o / os for a masculine noun', () => {
    expect(defArticle(GATO)).toBe('o');
    expect(defArticle(GATO, true)).toBe('os');
  });

  test('a / as for a feminine noun', () => {
    expect(defArticle(CASA)).toBe('a');
    expect(defArticle(CASA, true)).toBe('as');
  });

  test('defaults to the masculine without a gender', () => {
    expect(defArticle({ base: 'x' })).toBe('o');
  });
});
