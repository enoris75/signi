import { describe, expect, test } from 'vitest';
import { belloForm } from './belloForm.js';

describe('belloForm', () => {
  test("masculine singular: bel / bell' / bello", () => {
    expect(belloForm('masc', false, 'gatto')).toBe('bel');
    expect(belloForm('masc', false, 'uomo')).toBe("bell'");
    expect(belloForm('masc', false, 'spagnolo')).toBe('bello');
    expect(belloForm('masc', false, 'zaino')).toBe('bello');
  });

  test('masculine plural: bei / begli', () => {
    expect(belloForm('masc', true, 'gatti')).toBe('bei');
    expect(belloForm('masc', true, 'uomini')).toBe('begli');
    expect(belloForm('masc', true, 'spagnoli')).toBe('begli');
  });

  test("feminine: bella / bell' / belle", () => {
    expect(belloForm('fem', false, 'casa')).toBe('bella');
    expect(belloForm('fem', false, 'ala')).toBe("bell'");
    expect(belloForm('fem', true, 'case')).toBe('belle');
    expect(belloForm('fem', true, 'ali')).toBe('belle');
  });
});
