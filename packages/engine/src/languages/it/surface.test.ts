import { describe, expect, test } from 'vitest';
import { ACQUA, GATTO, UOMO } from './it.fixtures.js';
import { surface } from './surface.js';

describe('surface', () => {
  test('the base in the singular, the stored plural in the plural', () => {
    expect(surface(GATTO, false)).toBe('gatto');
    expect(surface(GATTO, true)).toBe('gatti');
    expect(surface(UOMO, true)).toBe('uomini');
  });

  test('a noun with no plural keeps its base', () => {
    expect(surface(ACQUA, true)).toBe('acqua');
  });

  test('nothing stored gives an empty surface', () => {
    expect(surface({}, false)).toBe('');
  });
});
