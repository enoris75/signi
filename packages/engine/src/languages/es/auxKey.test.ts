import { describe, expect, test } from 'vitest';
import { el, ELLA, GATO, np, NOSOTROS, TU, VOSOTROS, YO } from './es.fixtures.js';
import { auxKey } from './auxKey.js';

describe('auxKey', () => {
  test('person and number of a pronoun subject', () => {
    expect(auxKey(YO)).toBe('1sg');
    expect(auxKey(TU)).toBe('2sg');
    expect(auxKey(ELLA)).toBe('3sg');
    expect(auxKey(NOSOTROS)).toBe('1pl');
    expect(auxKey(VOSOTROS)).toBe('2pl');
  });

  test('a noun subject is third person', () => {
    expect(auxKey(GATO)).toBe('3sg');
    expect(auxKey({ ...GATO, number: 'plural' })).toBe('3pl');
  });

  test('a coordinated subject agrees as its group', () => {
    expect(auxKey(el(np(TU), np(GATO)).agreement)).toBe('2pl');
  });

  test('defaults to the third-person singular', () => {
    expect(auxKey({})).toBe('3sg');
  });
});
