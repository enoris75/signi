import { describe, expect, test } from 'vitest';
import { AILE, ANGE, CHAT, MAISON } from './fr.fixtures.js';
import { indefArticle } from './indefArticle.js';

describe('indefArticle', () => {
  test('un for a masculine, une for a feminine', () => {
    expect(indefArticle(CHAT, false)).toBe('un');
    expect(indefArticle(MAISON, false)).toBe('une');
  });

  test('des for any plural', () => {
    expect(indefArticle(CHAT, true)).toBe('des');
    expect(indefArticle(MAISON, true)).toBe('des');
  });

  test('never elides before a vowel', () => {
    expect(indefArticle(ANGE, false)).toBe('un');
    expect(indefArticle(AILE, false)).toBe('une');
  });

  test('a noun without gender defaults to the masculine', () => {
    expect(indefArticle({ base: 'mot' }, false)).toBe('un');
  });
});
