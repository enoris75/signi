import { describe, expect, test } from 'vitest';
import { ESSERE_IT } from './it.consts.js';
import { GATTO, IO, LORO, NOI, TU } from './it.fixtures.js';
import { auxKey } from './auxKey.js';

describe('auxKey', () => {
  test('person and number of a pronoun subject', () => {
    expect(auxKey(IO)).toBe('1sg');
    expect(auxKey(NOI)).toBe('1pl');
    expect(auxKey({ ...TU, number: 'plural' })).toBe('2pl');
    expect(auxKey(LORO)).toBe('3pl');
  });

  test('a noun subject defaults to third person singular', () => {
    expect(auxKey(GATTO)).toBe('3sg');
    expect(auxKey({ ...GATTO, number: 'plural' })).toBe('3pl');
  });

  test('keys straight into the auxiliary tables', () => {
    expect(ESSERE_IT.present[auxKey(TU)]).toBe('sei');
    expect(ESSERE_IT.past[auxKey(NOI)]).toBe('eravamo');
  });
});
