import { describe, expect, test } from 'vitest';
import { CASA, GAT, HOME } from './ca.fixtures.js';
import { defArticle } from './defArticle.js';

describe('defArticle', () => {
  test('el / la / els / les, agreeing in gender and number', () => {
    expect(defArticle(GAT)).toBe('el');
    expect(defArticle(CASA)).toBe('la');
    expect(defArticle(GAT, true)).toBe('els');
    expect(defArticle(CASA, true)).toBe('les');
  });

  test('leaves the elision before a vowel to caSurface', () => {
    expect(defArticle(HOME)).toBe('el');
  });
});
