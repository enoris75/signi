import { describe, expect, test } from 'vitest';
import { declineAdj } from './declineAdj.js';

describe('declineAdj', () => {
  test('takes the weak ending after the definite article', () => {
    expect(declineAdj('klein', 'nom', 'masc', false, 'definite')).toBe('kleine');
    expect(declineAdj('klein', 'acc', 'masc', false, 'definite')).toBe('kleinen');
    expect(declineAdj('klein', 'dat', 'fem', false, 'definite')).toBe('kleinen');
  });

  test('marks the gender itself after ein- or with no article', () => {
    expect(declineAdj('groß', 'nom', 'masc', false, 'indefinite')).toBe('großer');
    expect(declineAdj('groß', 'acc', 'neut', false, 'indefinite')).toBe('großes');
    expect(declineAdj('kalt', 'dat', 'neut', false, 'bare')).toBe('kaltem');
    expect(declineAdj('kalt', 'gen', 'fem', false, 'bare')).toBe('kalter');
  });

  test('the plural ignores gender', () => {
    expect(declineAdj('groß', 'nom', 'fem', true, 'definite')).toBe('großen');
    expect(declineAdj('groß', 'nom', 'neut', true, 'bare')).toBe('große');
  });

  test('a stem ending in -e absorbs the ending’s leading e', () => {
    expect(declineAdj('müde', 'nom', 'fem', false, 'definite')).toBe('müde');
    expect(declineAdj('müde', 'acc', 'masc', false, 'definite')).toBe('müden');
    expect(declineAdj('müde', 'nom', 'masc', false, 'indefinite')).toBe('müder');
  });

  test('a stem in unstressed -el loses its own e instead', () => {
    expect(declineAdj('dunkel', 'nom', 'masc', false, 'definite')).toBe('dunkle');
    expect(declineAdj('dunkel', 'nom', 'fem', false, 'indefinite')).toBe('dunkle');
    expect(declineAdj('dunkel', 'dat', 'neut', false, 'bare')).toBe('dunklem');
    // A comparative or superlative stem is past the -el: dunklere, dunkelste.
    expect(declineAdj('dunkler', 'nom', 'masc', false, 'definite')).toBe('dunklere');
    expect(declineAdj('dunkelst', 'nom', 'masc', false, 'definite')).toBe('dunkelste');
  });
});
