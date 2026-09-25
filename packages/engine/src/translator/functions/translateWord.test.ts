import { describe, expect, test } from 'vitest';
import type { LanguageCode, Translation } from '@signi/shared';
import { lexicon } from '../translator.fixtures.js';
import { translateWord } from './translateWord.js';

const LOOKUP = lexicon(
  {
    FIRST: { role: 'adjective', base: 'first' },
    SINGULAR: { role: 'adjective', base: 'singular' },
  },
  {
    it: {
      FIRST: { role: 'adjective', base: 'primo' },
      SINGULAR: { role: 'adjective', base: 'singolare' },
      PERSON: { base: 'persona', plural: 'persone', gender: 'fem', count: 'singular' },
      GENDER: { base: 'genere', plural: 'generi', gender: 'masc', count: 'singular' },
      PEOPLE: { base: 'gente', gender: 'fem', number: 'plural' },
      THINGS: { base: 'cose', gender: 'fem', count: 'plural' },
    },
    ja: {
      FIRST: { role: 'adjective', base: '一番目の' },
      SINGULAR: { role: 'adjective', base: '単数の' },
    },
  },
);

const text = (translations: Translation[], language: LanguageCode) => translations.find((t) => t.language === language)?.text;

describe('translateWord', () => {
  test('renders the word into every language, in engine order', () => {
    expect(translateWord('FIRST', LOOKUP).map((t) => t.language)).toEqual(['en', 'it', 'fr', 'de', 'es', 'ja', 'pt', 'gsw']);
  });

  test("a word with nothing to agree with takes the engine's citation form", () => {
    const first = translateWord('FIRST', LOOKUP);
    expect(text(first, 'en')).toBe('first');
    expect(text(first, 'it')).toBe('primo');
    expect(text(first, 'ja')).toBe('一番目');
  });

  test('an adjective agrees with the gender of the noun it describes', () => {
    expect(text(translateWord('FIRST', LOOKUP, 'PERSON'), 'it')).toBe('prima');
    expect(text(translateWord('FIRST', LOOKUP, 'GENDER'), 'it')).toBe('primo');
  });

  test("and with the noun's number, read from its number or else its count", () => {
    expect(text(translateWord('FIRST', LOOKUP, 'PEOPLE'), 'it')).toBe('prime');
    expect(text(translateWord('FIRST', LOOKUP, 'THINGS'), 'it')).toBe('prime');
  });

  test('a noun with neither gender nor number agrees as the masculine singular', () => {
    expect(text(translateWord('FIRST', LOOKUP, 'NOTHING'), 'it')).toBe('primo');
  });

  test('several words join the way the language joins words', () => {
    const label = translateWord(['FIRST', 'SINGULAR'], LOOKUP, 'PERSON');
    expect(text(label, 'en')).toBe('first singular');
    expect(text(label, 'it')).toBe('prima singolare');
    expect(text(label, 'ja')).toBe('一番目単数');
  });

  test('a word a language has no form for is left out', () => {
    const label = translateWord(['FIRST', 'MISSING'], LOOKUP);
    expect(text(label, 'en')).toBe('first');
    expect(text(label, 'it')).toBe('primo');
  });
});
