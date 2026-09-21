import { describe, expect, test } from 'vitest';
import { np } from '../languages/resolved.fixtures.js';
import { tonicPronoun } from './tonicPronoun.js';

describe('tonicPronoun', () => {
  test('a pronoun gives its disjunctive surface', () => {
    expect(tonicPronoun(np({ person: '3', base: 'er', disjunctive: 'ihm' }))).toBe('ihm');
    expect(tonicPronoun(np({ person: '1', base: 'io', disjunctive: 'me' }))).toBe('me');
  });

  test('a pronoun with no tonic form falls back to its base surface', () => {
    expect(tonicPronoun(np({ person: '3', base: '彼' }))).toBe('彼');
  });

  test('a noun gives undefined, so the caller renders a noun phrase', () => {
    expect(tonicPronoun(np({ base: 'cat' }))).toBeUndefined();
    expect(tonicPronoun(np({ base: 'gatto', disjunctive: 'lui' }))).toBeUndefined();
  });
});
