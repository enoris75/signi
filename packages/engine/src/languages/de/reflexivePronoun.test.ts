import { describe, expect, test } from 'vitest';
import { BEWEGEN, ESSEN } from './de.fixtures.js';
import { reflexivePronoun } from './reflexivePronoun.js';

describe('reflexivePronoun', () => {
  test('a plain verb has none', () => {
    expect(reflexivePronoun(ESSEN, '3sg')).toBe('');
    expect(reflexivePronoun({}, '1sg')).toBe('');
  });

  test('a "sich" infinitive takes the accusative pronoun agreeing with the person', () => {
    expect(reflexivePronoun(BEWEGEN, '1sg')).toBe('mich');
    expect(reflexivePronoun(BEWEGEN, '2sg')).toBe('dich');
    expect(reflexivePronoun(BEWEGEN, '3sg')).toBe('sich');
    expect(reflexivePronoun(BEWEGEN, '1pl')).toBe('uns');
    expect(reflexivePronoun(BEWEGEN, '2pl')).toBe('euch');
    expect(reflexivePronoun(BEWEGEN, '3pl')).toBe('sich');
  });
});
