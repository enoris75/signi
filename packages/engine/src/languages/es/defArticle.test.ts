import { describe, expect, test } from 'vitest';
import { AGUA, CASA, GATO, IDIOMA } from './es.fixtures.js';
import { defArticle } from './defArticle.js';

describe('defArticle', () => {
  test('el / la in the singular', () => {
    expect(defArticle(GATO)).toBe('el');
    expect(defArticle(CASA)).toBe('la');
  });

  test('los / las in the plural', () => {
    expect(defArticle(GATO, true)).toBe('los');
    expect(defArticle(CASA, true)).toBe('las');
  });

  test('follows the declared gender, not the ending', () => {
    expect(defArticle(IDIOMA)).toBe('el');
  });

  test('a stressed-a feminine takes el in the singular only', () => {
    expect(defArticle(AGUA)).toBe('el');
    expect(defArticle(AGUA, true)).toBe('las');
  });

  test('defaults to the masculine without a gender', () => {
    expect(defArticle({ base: 'slot' })).toBe('el');
  });
});
