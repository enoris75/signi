import { describe, expect, test } from 'vitest';
import type { LanguageCode, Translation } from '@signi/shared';
import { lexicon } from '../translator.fixtures.js';
import { translateDeterminer } from './translateDeterminer.js';

const LOOKUP = lexicon(
  {
    NOUN: { base: 'noun', plural: 'nouns', count: 'singular' },
    APPLE: { base: 'apple', plural: 'apples', count: 'singular' },
  },
  {
    it: {
      NOUN: { base: 'nome', plural: 'nomi', gender: 'masc', count: 'singular' },
      APPLE: { base: 'mela', plural: 'mele', gender: 'fem', count: 'singular' },
    },
  },
);

const text = (translations: Translation[], language: LanguageCode) => translations.find((t) => t.language === language)?.text;

describe('translateDeterminer', () => {
  test('names the determiner in every language, in engine order', () => {
    expect(translateDeterminer('definite', LOOKUP).map((t) => t.language)).toEqual(['en', 'it', 'fr', 'de', 'es', 'ja', 'pt', 'gsw']);
  });

  test('cites the determiner with the noun NOUN unless given another', () => {
    const asked = new Set<string>();
    translateDeterminer('definite', (conceptId, language) => {
      asked.add(conceptId);
      return LOOKUP(conceptId, language);
    });
    expect([...asked]).toEqual(['NOUN']);
  });

  test('the determiner is the one the citation noun takes', () => {
    expect(text(translateDeterminer('indefinite', LOOKUP), 'en')).toBe('a');
    expect(text(translateDeterminer('indefinite', LOOKUP, 'APPLE'), 'en')).toBe('an');
    expect(text(translateDeterminer('definite', LOOKUP), 'it')).toBe('il');
    expect(text(translateDeterminer('definite', LOOKUP, 'APPLE'), 'it')).toBe('la');
  });

  test('the inherently plural quantifiers name themselves in the plural, the rest in the singular', () => {
    expect(text(translateDeterminer('all', LOOKUP), 'it')).toBe('tutti i');
    expect(text(translateDeterminer('this', LOOKUP), 'it')).toBe('questo');
  });

  test('a determiner the language spells nothing for shows as an em-dash', () => {
    expect(translateDeterminer('bare', LOOKUP).map((t) => t.text)).toEqual(Array(8).fill('—'));
    expect(text(translateDeterminer('definite', LOOKUP), 'ja')).toBe('—');
    expect(text(translateDeterminer('this', LOOKUP), 'ja')).toBe('この');
  });
});
