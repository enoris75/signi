import { describe, expect, test } from 'vitest';
import { adj, BOOT, GROSS, HAUS, np, nounModifier, SEGEL } from './de.fixtures.js';
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

  test('leaves out a modifier that carries its own adjective', () => {
    const phrase = np(BOOT, {}, { nounModifiers: [nounModifier(SEGEL, [adj(GROSS)])] });
    expect(germanCompound(phrase, 'Boot')).toBe('Boot');
  });

  test('an empty head word stays empty', () => {
    expect(germanCompound(np(BOOT, {}, { nounModifiers: [nounModifier(SEGEL)] }), '')).toBe('');
  });
});
