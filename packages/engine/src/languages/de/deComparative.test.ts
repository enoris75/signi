import { describe, expect, test } from 'vitest';
import { deComparative } from './deComparative.js';

describe('deComparative', () => {
  test('adds -er to a consonant-final base', () => {
    expect(deComparative('klein')).toBe('kleiner');
    expect(deComparative('schnell')).toBe('schneller');
  });

  test('adds a bare -r to a base already ending in -e', () => {
    expect(deComparative('müde')).toBe('müder');
    expect(deComparative('leise')).toBe('leiser');
  });

  test('drops the e of an unstressed -el', () => {
    expect(deComparative('dunkel')).toBe('dunkler');
    expect(deComparative('schnell')).toBe('schneller');
  });

  test('does not umlaut the stem — that is the caller’s job', () => {
    expect(deComparative('alt')).toBe('alter');
  });
});
