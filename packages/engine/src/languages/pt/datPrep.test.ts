import { describe, expect, test } from 'vitest';
import { ANTARTIDA, CASA, MENINO } from './pt.fixtures.js';
import { datPrep } from './datPrep.js';

describe('datPrep', () => {
  test('a fuses with the definite article: ao / à / aos / às', () => {
    expect(datPrep(MENINO)).toBe('ao');
    expect(datPrep(CASA)).toBe('à');
    expect(datPrep(MENINO, true)).toBe('aos');
    expect(datPrep(CASA, true)).toBe('às');
  });

  test('a proper noun takes it too', () => {
    expect(datPrep(ANTARTIDA)).toBe('à');
  });
});
