import { describe, expect, test } from 'vitest';
import { CHAT, IL, JE, TU } from './fr.fixtures.js';
import { auxKey } from './auxKey.js';

describe('auxKey', () => {
  test('person and number from a pronoun subject', () => {
    expect(auxKey(JE)).toBe('1sg');
    expect(auxKey(TU)).toBe('2sg');
    expect(auxKey({ ...IL, number: 'plural' })).toBe('3pl');
    expect(auxKey({ ...JE, number: 'plural' })).toBe('1pl');
  });

  test('a noun subject is third person, singular unless marked plural', () => {
    expect(auxKey(CHAT)).toBe('3sg');
    expect(auxKey({ ...CHAT, number: 'plural' })).toBe('3pl');
  });
});
