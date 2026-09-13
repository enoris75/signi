import { describe, expect, test } from 'vitest';
import { AILE, ANGE, CHAT, HOMME, MAISON } from './fr.fixtures.js';
import { demArticle } from './demArticle.js';

describe('demArticle', () => {
  test('ce for a masculine, cette for a feminine, ces for any plural', () => {
    expect(demArticle(CHAT, false, 'chat')).toBe('ce');
    expect(demArticle(MAISON, false, 'maison')).toBe('cette');
    expect(demArticle(CHAT, true, 'chats')).toBe('ces');
    expect(demArticle(AILE, true, 'ailes')).toBe('ces');
  });

  test('cet before a masculine vowel sound, including an h muet', () => {
    expect(demArticle(ANGE, false, 'ange')).toBe('cet');
    expect(demArticle(HOMME, false, 'homme')).toBe('cet');
  });

  test('the feminine stays cette before a vowel', () => {
    expect(demArticle(AILE, false, 'aile')).toBe('cette');
  });

  test('is chosen on the word that actually follows it', () => {
    expect(demArticle(ANGE, false, 'petit')).toBe('ce');
    expect(demArticle(HOMME, false, 'grand')).toBe('ce');
    expect(demArticle(CHAT, false, 'autre')).toBe('cet');
  });
});
