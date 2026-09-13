import { describe, expect, test } from 'vitest';
import { ACQUA, AFRICA, ALA, CASA, GATTO, SLOT, SPAGNOLO, UOMO } from './it.fixtures.js';
import { defArticle } from './defArticle.js';

describe('defArticle', () => {
  test('masculine before a consonant: il / i', () => {
    expect(defArticle(GATTO)).toBe('il');
    expect(defArticle(GATTO, true)).toBe('i');
  });

  test("masculine before a vowel: l' / gli", () => {
    expect(defArticle(UOMO)).toBe("l'");
    expect(defArticle(UOMO, true)).toBe('gli');
  });

  test('masculine before s + consonant or z: lo / gli', () => {
    expect(defArticle(SPAGNOLO)).toBe('lo');
    expect(defArticle(SLOT, true)).toBe('gli');
    // Not seeded: a z-initial noun.
    const zaino = { base: 'zaino', plural: 'zaini', gender: 'masc' };
    expect(defArticle(zaino)).toBe('lo');
    expect(defArticle(zaino, true)).toBe('gli');
  });

  test("feminine: la / l' before a vowel, le in the plural", () => {
    expect(defArticle(CASA)).toBe('la');
    expect(defArticle(ALA)).toBe("l'");
    expect(defArticle(ACQUA)).toBe("l'");
    expect(defArticle(CASA, true)).toBe('le');
    expect(defArticle(ALA, true)).toBe('le');
  });

  test('a capitalised proper name elides like any vowel-initial word', () => {
    expect(defArticle(AFRICA)).toBe("l'");
  });

  test('the word that actually follows decides, not the noun', () => {
    // "il grande uomo", "i grandi uomini", "la grande ala"
    expect(defArticle(UOMO, false, 'grande')).toBe('il');
    expect(defArticle(UOMO, true, 'grandi')).toBe('i');
    expect(defArticle(ALA, false, 'grande')).toBe('la');
  });

  test('defaults to the masculine', () => {
    expect(defArticle({ base: 'libro' })).toBe('il');
  });
});
