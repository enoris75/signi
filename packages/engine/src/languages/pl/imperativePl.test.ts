import { describe, expect, test } from 'vitest';
import { imperativePl } from './imperativePl.js';
import { JESC, MUSIEC, WIDZIEC } from './pl.fixtures.js';

describe('imperativePl', () => {
  test('the three persons, in the aspect asked for', () => {
    expect(imperativePl(JESC, true, '2sg')).toBe('zjedz');
    expect(imperativePl(JESC, true, '1pl')).toBe('zjedzmy');
    expect(imperativePl(JESC, false, '2pl')).toBe('jedzcie');
  });

  test('a verb with no imperfective imperative takes the perfective one', () => {
    expect(imperativePl(WIDZIEC, false, '2sg')).toBe('zobacz');
  });

  test('a 3rd person is niech + the non-past', () => {
    expect(imperativePl(JESC, true, '3sg')).toBe('niech zje');
  });

  test('a modal has none', () => {
    expect(imperativePl(MUSIEC, false, '2sg')).toBeUndefined();
  });
});
