import { describe, expect, test } from 'vitest';
import type { LanguageCode, PronominalPossessor, Translation } from '@signi/shared';
import { lexicon } from '../translator.fixtures.js';
import { translatePossessive } from './translatePossessive.js';

const LOOKUP = lexicon(
  {
    NOUN: { base: 'noun', plural: 'nouns', count: 'singular' },
    HOUSE: { base: 'house', plural: 'houses', count: 'singular' },
  },
  {
    it: {
      NOUN: { base: 'nome', plural: 'nomi', gender: 'masc', count: 'singular' },
      HOUSE: { base: 'casa', plural: 'case', gender: 'fem', count: 'singular' },
    },
    de: {
      NOUN: { base: 'Nomen', plural: 'Nomen', gender: 'neut', count: 'singular' },
      HOUSE: { base: 'Haus', plural: 'Häuser', gender: 'neut', count: 'singular' },
    },
  },
);

const feats = (over: Partial<PronominalPossessor> = {}): PronominalPossessor => ({
  kind: 'pronominal', person: '3', number: 'singular', ...over,
});

const text = (translations: Translation[], language: LanguageCode) => translations.find((t) => t.language === language)?.text;

describe('translatePossessive', () => {
  test('names the possessive in every language, in engine order', () => {
    expect(translatePossessive(feats(), LOOKUP).map((t) => t.language)).toEqual(['en', 'it', 'fr', 'de', 'es', 'ja', 'pt']);
  });

  test('cites the possessive with the noun NOUN unless given another', () => {
    const asked = new Set<string>();
    translatePossessive(feats(), (conceptId, language) => {
      asked.add(conceptId);
      return LOOKUP(conceptId, language);
    });
    expect([...asked]).toEqual(['NOUN']);
  });

  test('spells the antecedent’s person and number', () => {
    expect(translatePossessive(feats({ person: '1' }), LOOKUP).map((t) => t.text))
      .toEqual(['my', 'mio', 'mon', 'mein', 'mi', '私の', 'meu']);
    expect(translatePossessive(feats({ person: '1', number: 'plural' }), LOOKUP).map((t) => t.text))
      .toEqual(['our', 'nostro', 'notre', 'unser', 'nuestro', '私たちの', 'nosso']);
  });

  test('the antecedent’s gender splits only the languages that spell it', () => {
    // en/de/ja read the antecedent's own gender; the Romance languages agree with the possessed
    // head instead, so his and her collapse there.
    expect(text(translatePossessive(feats({ gender: 'fem' }), LOOKUP), 'en')).toBe('her');
    expect(text(translatePossessive(feats({ gender: 'fem' }), LOOKUP), 'de')).toBe('ihr');
    expect(text(translatePossessive(feats({ gender: 'fem' }), LOOKUP), 'ja')).toBe('彼女の');
    expect(text(translatePossessive(feats({ gender: 'masc' }), LOOKUP), 'it')).toBe('suo');
    expect(text(translatePossessive(feats({ gender: 'fem' }), LOOKUP), 'it')).toBe('suo');
  });

  test('the Romance possessive agrees with the citation noun, not the antecedent', () => {
    expect(text(translatePossessive(feats(), LOOKUP), 'it')).toBe('suo'); // "nome" is masculine
    expect(text(translatePossessive(feats(), LOOKUP, 'HOUSE'), 'it')).toBe('sua'); // "casa" is feminine
  });

  test('cites the possessive in the singular, whatever number the citation noun carries', () => {
    const plural = lexicon({ NOUN: { base: 'noun', plural: 'nouns', count: 'plural' } });
    expect(text(translatePossessive(feats(), plural), 'en')).toBe('his');
  });

  test('leaves off the article the phrase would put before it', () => {
    // it "il suo cane", pt "o seu cão" — the label names the possessive alone.
    expect(text(translatePossessive(feats(), LOOKUP), 'pt')).toBe('seu');
  });

  test('a German possessive is cited in the nominative, like a determiner', () => {
    expect(text(translatePossessive(feats({ person: '1' }), LOOKUP), 'de')).toBe('mein');
    expect(text(translatePossessive(feats({ person: '2', number: 'plural' }), LOOKUP), 'de')).toBe('euer');
  });
});
