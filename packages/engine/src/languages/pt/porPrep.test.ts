import { describe, expect, test } from 'vitest';
import { CASA, EUROPA, LAR } from './pt.fixtures.js';
import { porPrep } from './porPrep.js';

describe('porPrep', () => {
  test('por fuses with the definite article: pelo / pela / pelos / pelas', () => {
    expect(porPrep(LAR)).toBe('pelo');
    expect(porPrep(CASA)).toBe('pela');
    expect(porPrep(LAR, true)).toBe('pelos');
    expect(porPrep(CASA, true)).toBe('pelas');
  });

  test('a proper noun takes it too', () => {
    expect(porPrep(EUROPA)).toBe('pela');
  });
});
