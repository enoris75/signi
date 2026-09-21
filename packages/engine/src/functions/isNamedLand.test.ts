import { describe, expect, test } from 'vitest';
import { isNamedLand } from './isNamedLand.js';

describe('isNamedLand', () => {
  test('a continent and a country are lands', () => {
    expect(isNamedLand({ base: 'Europa', proper: '1', isA: 'CONTINENT' })).toBe(true);
    expect(isNamedLand({ base: 'Italia', proper: '1', isA: 'COUNTRY' })).toBe(true);
  });

  test('any other place is not', () => {
    expect(isNamedLand({ base: 'casa', isA: 'BUILDING' })).toBe(false);
    expect(isNamedLand({ base: 'luogo' })).toBe(false);
  });

  test('the genus itself is not a land name', () => {
    expect(isNamedLand({ base: 'paese', isA: 'PLACE' })).toBe(false);
  });
});
