import { describe, expect, test } from 'vitest';
import { HAUS, KATER, KATZE } from './de.fixtures.js';
import { relativePronoun } from './relativePronoun.js';

describe('relativePronoun', () => {
  test('is the definite article in the nominative, accusative and singular dative', () => {
    expect(relativePronoun(KATER, 'nom', false)).toBe('der');
    expect(relativePronoun(KATER, 'acc', false)).toBe('den');
    expect(relativePronoun(HAUS, 'dat', false)).toBe('dem');
    expect(relativePronoun(KATZE, 'dat', false)).toBe('der');
    expect(relativePronoun(KATER, 'acc', true)).toBe('die');
  });

  test('lengthens to denen in the dative plural', () => {
    expect(relativePronoun(HAUS, 'dat', true)).toBe('denen');
  });

  test('is dessen / deren in the genitive', () => {
    expect(relativePronoun(KATER, 'gen', false)).toBe('dessen');
    expect(relativePronoun(HAUS, 'gen', false)).toBe('dessen');
    expect(relativePronoun(KATZE, 'gen', false)).toBe('deren');
    expect(relativePronoun(KATER, 'gen', true)).toBe('deren');
  });
});
