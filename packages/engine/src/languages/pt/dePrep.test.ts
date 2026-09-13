import { describe, expect, test } from 'vitest';
import { EUROPA, GATO, LUZ } from './pt.fixtures.js';
import { dePrep } from './dePrep.js';

describe('dePrep', () => {
  test('de fuses with the definite article: do / da / dos / das', () => {
    expect(dePrep(GATO)).toBe('do');
    expect(dePrep(LUZ)).toBe('da');
    expect(dePrep(GATO, true)).toBe('dos');
    expect(dePrep(LUZ, true)).toBe('das');
  });

  test('a proper noun takes it too', () => {
    expect(dePrep(EUROPA)).toBe('da');
  });
});
