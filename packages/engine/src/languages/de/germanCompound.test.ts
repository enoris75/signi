import { describe, expect, test } from 'vitest';
import { adj, BOOT, GESCHWINDIGKEIT, GROSS, HAUS, JUNGE, np, nounModifier, SEGEL, WORT } from './de.fixtures.js';
import { germanCompound } from './germanCompound.js';

const TUER = { base: 'Tür', plural: 'Türen', gender: 'fem', count: 'singular' };
const SCHLUESSEL = { base: 'Schlüssel', plural: 'Schlüssel', gender: 'masc', count: 'singular' };

describe('germanCompound', () => {
  test('returns the head word unchanged when there are no modifiers', () => {
    expect(germanCompound(np(BOOT), 'Boot')).toBe('Boot');
  });

  test('prefixes the modifier and lowercases the head', () => {
    const phrase = np(BOOT, {}, { nounModifiers: [nounModifier(SEGEL)] });
    expect(germanCompound(phrase, 'Boot')).toBe('Segelboot');
    expect(germanCompound(phrase, 'Boote')).toBe('Segelboote');
  });

  test('chains several modifiers in order into one word', () => {
    const phrase = np(SCHLUESSEL, {}, { nounModifiers: [nounModifier(HAUS), nounModifier(TUER)] });
    expect(germanCompound(phrase, 'Schlüssel')).toBe('Haustürschlüssel');
  });

  // B10: each modifier enters in its compound stem, linking element included (see `compoundStem`).
  test('joins each modifier by its linking element', () => {
    const PHRASE = { base: 'Phrase', plural: 'Phrasen', gender: 'fem', count: 'singular' };
    const HUND = { base: 'Hund', plural: 'Hunde', gender: 'masc', count: 'singular', compound: 'Hunde' };
    expect(germanCompound(np(WORT, {}, { nounModifiers: [nounModifier(GESCHWINDIGKEIT)] }), 'Wort')).toBe('Geschwindigkeitswort');
    expect(germanCompound(np(BOOT, {}, { nounModifiers: [nounModifier(JUNGE)] }), 'Boot')).toBe('Jungenboot');
    expect(germanCompound(np(HAUS, {}, { nounModifiers: [nounModifier(HUND)] }), 'Haus')).toBe('Hundehaus');
    expect(germanCompound(np(SCHLUESSEL, {}, { nounModifiers: [nounModifier(PHRASE), nounModifier(GESCHWINDIGKEIT)] }), 'Schlüssel'))
      .toBe('Phrasengeschwindigkeitsschlüssel');
  });

  test('leaves out a modifier that carries its own adjective', () => {
    const phrase = np(BOOT, {}, { nounModifiers: [nounModifier(SEGEL, [adj(GROSS)])] });
    expect(germanCompound(phrase, 'Boot')).toBe('Boot');
  });

  test('an empty head word stays empty', () => {
    expect(germanCompound(np(BOOT, {}, { nounModifiers: [nounModifier(SEGEL)] }), '')).toBe('');
  });

  // A295: a compound holds neither an inflected adjective nor a genitive.
  test('leaves out a modifier whose name holds an adjective or a postnominal genitive', () => {
    const FRAU = { base: 'Frau', plural: 'Frauen', gender: 'fem', count: 'singular', adjective: 'jung' };
    expect(germanCompound(np(BOOT, {}, { nounModifiers: [nounModifier(FRAU)] }), 'Boot')).toBe('Boot');
    expect(germanCompound(np(BOOT, {}, { nounModifiers: [nounModifier({ base: 'Ziel', gender: 'neut', postnominal: 'des Ortes' })] }), 'Boot')).toBe('Boot');
    expect(germanCompound(np(BOOT, {}, { nounModifiers: [nounModifier(FRAU), nounModifier(SEGEL)] }), 'Boot')).toBe('Segelboot');
  });
});
