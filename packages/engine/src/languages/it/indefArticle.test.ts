import { describe, expect, test } from 'vitest';
import { ALA, CASA, GATTO, SLOT, UOMO } from './it.fixtures.js';
import { indefArticle } from './indefArticle.js';

describe('indefArticle', () => {
  test('masculine un, with no elision even before a vowel', () => {
    expect(indefArticle(GATTO, false, 'gatto')).toBe('un');
    expect(indefArticle(UOMO, false, 'uomo')).toBe('un');
  });

  test('masculine uno before s + consonant or z', () => {
    expect(indefArticle(SLOT, false, 'slot')).toBe('uno');
    expect(indefArticle(GATTO, false, 'zaino')).toBe('uno');
  });

  test("feminine una, eliding to un' before a vowel", () => {
    expect(indefArticle(CASA, false, 'casa')).toBe('una');
    expect(indefArticle(ALA, false, 'ala')).toBe("un'");
    // "una grande ala" — the adjective, not the noun, follows the article
    expect(indefArticle(ALA, false, 'grande')).toBe('una');
  });

  test('the plural indefinite is bare', () => {
    expect(indefArticle(GATTO, true, 'gatti')).toBe('');
    expect(indefArticle(CASA, true, 'case')).toBe('');
  });

  test('defaults to the masculine', () => {
    expect(indefArticle({ base: 'libro' }, false, 'libro')).toBe('un');
  });
});
