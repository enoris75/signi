import { describe, expect, test } from 'vitest';
import { CASA, EL, LIBRO, NINO, np, YO } from './es.fixtures.js';
import { prepObjectText } from './prepObjectText.js';

describe('prepObjectText', () => {
  test('a preposition other than a / de leads the determiner as it is', () => {
    expect(prepObjectText(np(LIBRO), 'en')).toBe('en el libro');
    expect(prepObjectText(np(CASA, { definiteness: 'indefinite' }), 'en')).toBe('en una casa');
    expect(prepObjectText(np(CASA, { number: 'plural' }), 'en')).toBe('en las casas');
  });

  test('a and de fuse with el', () => {
    expect(prepObjectText(np(NINO), 'a')).toBe('al niño');
    expect(prepObjectText(np(LIBRO), 'de')).toBe('del libro');
  });

  // A325: a determiner kept beside a possessive, and "todos", are the noun phrase's to write.
  test('a determiner beside a possessive keeps its slot, the possessive following the noun', () => {
    const mine = { possessor: { kind: 'pronominal', person: '1', number: 'singular' } as const };
    expect(prepObjectText(np(NINO, { definiteness: 'indefinite' }, mine), 'a')).toBe('a un niño mío');
    expect(prepObjectText(np(NINO, { definiteness: 'this' }, mine), 'a')).toBe('a este niño mío');
    expect(prepObjectText(np(NINO, { definiteness: 'all', number: 'plural' }, mine), 'a')).toBe('a todos mis niños');
    expect(prepObjectText(np(NINO, {}, mine), 'a')).toBe('a mi niño');
  });

  // A340: the numeral stands between the determiner and the noun, and at one beside a definite it is
  // left out (A319).
  test('a counted object keeps its numeral', () => {
    expect(prepObjectText(np(NINO, { numeral: '2', number: 'plural' }), 'a')).toBe('a los dos niños');
    expect(prepObjectText(np(NINO, { numeral: '2', number: 'plural', definiteness: 'bare' }), 'a')).toBe('a dos niños');
    expect(prepObjectText(np(CASA, { numeral: '2', number: 'plural', definiteness: 'this' }), 'en')).toBe('en estas dos casas');
    expect(prepObjectText(np(NINO, { numeral: '1' }), 'a')).toBe('al niño');
  });

  test('a pronoun takes its tonic form', () => {
    expect(prepObjectText(np(YO), 'en')).toBe('en mí');
    expect(prepObjectText(np(EL), 'en')).toBe('en él');
  });
});
