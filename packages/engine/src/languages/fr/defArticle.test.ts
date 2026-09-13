import { describe, expect, test } from 'vitest';
import { AFRIQUE, AILE, ANGE, CHAT, HAUTEUR, HOMME, LIVRE, MAISON } from './fr.fixtures.js';
import { defArticle } from './defArticle.js';

describe('defArticle', () => {
  test('le for a masculine, la for a feminine, les for any plural', () => {
    expect(defArticle(CHAT)).toBe('le');
    expect(defArticle(MAISON)).toBe('la');
    expect(defArticle(MAISON, true)).toBe('les');
    expect(defArticle(ANGE, true)).toBe('les');
  });

  test("elides to l' before a vowel of either gender", () => {
    expect(defArticle(ANGE)).toBe("l'");
    expect(defArticle(AILE)).toBe("l'");
    expect(defArticle(AFRIQUE)).toBe("l'");
  });

  test('elides before an h muet but not an h aspiré', () => {
    expect(defArticle(HOMME)).toBe("l'");
    expect(defArticle(HAUTEUR)).toBe('la');
  });

  test('is chosen on the word that actually follows it', () => {
    expect(defArticle(ANGE, false, 'petit')).toBe('le');
    expect(defArticle(HOMME, false, 'vieux')).toBe('le');
    expect(defArticle(LIVRE, false, 'autre')).toBe("l'");
  });

  test('a noun without gender defaults to the masculine', () => {
    expect(defArticle({ base: 'mot' })).toBe('le');
  });
});
