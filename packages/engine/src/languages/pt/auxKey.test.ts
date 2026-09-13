import { describe, expect, test } from 'vitest';
import { ELA, ELES, EU, NOS, VOCE } from './pt.fixtures.js';
import { auxKey } from './auxKey.js';

describe('auxKey', () => {
  test('joins person and number', () => {
    expect(auxKey(EU)).toBe('1sg');
    expect(auxKey(VOCE)).toBe('2sg');
    expect(auxKey(NOS)).toBe('1pl');
    expect(auxKey(ELES)).toBe('3pl');
    expect(auxKey(ELA)).toBe('3sg');
  });

  test('a noun subject defaults to the third person singular', () => {
    expect(auxKey({ base: 'gato' })).toBe('3sg');
    expect(auxKey({ base: 'gatos', number: 'plural' })).toBe('3pl');
  });
});
