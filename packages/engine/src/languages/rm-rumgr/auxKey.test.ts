import { describe, expect, test } from 'vitest';
import { ELS, GIAT, INS, JAU, NUS, TI } from './rumgr.fixtures.js';
import { auxKey } from './auxKey.js';

describe('auxKey', () => {
  test('person and number of the subject', () => {
    expect(auxKey(JAU)).toBe('1sg');
    expect(auxKey(TI)).toBe('2sg');
    expect(auxKey(NUS)).toBe('1pl');
    expect(auxKey(ELS)).toBe('3pl');
  });

  test('a noun and the generic ins are the third person', () => {
    expect(auxKey(GIAT)).toBe('3sg');
    expect(auxKey({ ...GIAT, number: 'plural' })).toBe('3pl');
    expect(auxKey(INS)).toBe('3sg');
  });
});
