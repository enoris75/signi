import { describe, expect, test } from 'vitest';
import { AFRICA, CASA, LIVRO } from './pt.fixtures.js';
import { emPrep } from './emPrep.js';

describe('emPrep', () => {
  test('em fuses with the definite article: no / na / nos / nas', () => {
    expect(emPrep(LIVRO)).toBe('no');
    expect(emPrep(CASA)).toBe('na');
    expect(emPrep(LIVRO, true)).toBe('nos');
    expect(emPrep(CASA, true)).toBe('nas');
  });

  test('a proper noun takes it too', () => {
    expect(emPrep(AFRICA)).toBe('na');
  });
});
