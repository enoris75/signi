import { describe, expect, test } from 'vitest';
import { AUA, CHASA, EUROPA, GIAT, GIATTA, UM } from './rumgr.fixtures.js';
import { defArticle } from './defArticle.js';

describe('defArticle', () => {
  test('masculine: il / ils', () => {
    expect(defArticle(GIAT)).toBe('il');
    expect(defArticle(GIAT, true)).toBe('ils');
  });

  test('feminine: la / las', () => {
    expect(defArticle(CHASA)).toBe('la');
    expect(defArticle(GIATTA, true)).toBe('las');
  });

  test("l' before a vowel in both genders", () => {
    expect(defArticle(UM)).toBe("l'");
    expect(defArticle(AUA)).toBe("l'");
    expect(defArticle(EUROPA)).toBe("l'");
  });

  test('the plural never elides', () => {
    expect(defArticle(UM, true)).toBe('ils');
    expect(defArticle({ ...AUA, plural: 'auas' }, true)).toBe('las');
  });

  test('the word that actually follows decides, not the noun', () => {
    // "il grond um", "l'auter giat", "la gronda aua"
    expect(defArticle(UM, false, 'grond')).toBe('il');
    expect(defArticle(GIAT, false, 'auter')).toBe("l'");
    expect(defArticle(AUA, false, 'gronda')).toBe('la');
  });

  test('an accented vowel elides too', () => {
    expect(defArticle(GIAT, false, 'è')).toBe("l'");
  });

  test('defaults to the masculine', () => {
    expect(defArticle({ base: 'cudesch' })).toBe('il');
  });
});
