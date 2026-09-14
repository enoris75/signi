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

  test('a pronoun takes its tonic form', () => {
    expect(prepObjectText(np(YO), 'en')).toBe('en mí');
    expect(prepObjectText(np(EL), 'en')).toBe('en él');
  });
});
