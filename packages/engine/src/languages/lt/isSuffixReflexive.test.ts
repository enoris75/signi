import { describe, expect, test } from 'vitest';
import { isSuffixReflexive } from './isSuffixReflexive.js';
import { JUOKTIS, PRAUSTIS, VALGYTI } from './lt.fixtures.js';

describe('isSuffixReflexive', () => {
  test('a -tis infinitive under a reflexive lexeme', () => {
    expect(isSuffixReflexive(JUOKTIS, false)).toBe(true);
    expect(isSuffixReflexive(PRAUSTIS, false)).toBe(true);
  });

  test('its prefix-reflexive perfective is not, nor is a plain verb', () => {
    expect(isSuffixReflexive(PRAUSTIS, true)).toBe(false);
    expect(isSuffixReflexive(VALGYTI, false)).toBe(false);
  });
});
