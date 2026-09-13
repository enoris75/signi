import { describe, expect, test } from 'vitest';
import { AFRICA, AGUA, ANTARTIDA, CASA, GATO } from './es.fixtures.js';
import { contractArt } from './contractArt.js';

describe('contractArt', () => {
  test('a common noun takes its definite article', () => {
    expect(contractArt(GATO, false)).toBe('el');
    expect(contractArt(CASA, true)).toBe('las');
    expect(contractArt(AGUA, false)).toBe('el');
  });

  test('a common noun ignores its determiner — the callers only contract a definite one', () => {
    expect(contractArt({ ...GATO, definiteness: 'indefinite' }, false)).toBe('el');
  });

  test('a proper name goes bare unless it is inherently articled', () => {
    expect(contractArt(AFRICA, false)).toBe('');
    expect(contractArt(ANTARTIDA, false)).toBe('la');
  });
});
