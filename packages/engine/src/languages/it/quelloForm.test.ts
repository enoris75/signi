import { describe, expect, test } from 'vitest';
import { ALA, CASA, GATTO, SLOT, UOMO } from './it.fixtures.js';
import { quelloForm } from './quelloForm.js';

describe('quelloForm', () => {
  test("masculine follows the article: quel / quello / quell'", () => {
    expect(quelloForm(GATTO, false, 'gatto')).toBe('quel');
    expect(quelloForm(SLOT, false, 'slot')).toBe('quello');
    expect(quelloForm(UOMO, false, 'uomo')).toBe("quell'");
  });

  test('masculine plural: quei / quegli', () => {
    expect(quelloForm(GATTO, true, 'gatti')).toBe('quei');
    expect(quelloForm(UOMO, true, 'uomini')).toBe('quegli');
    expect(quelloForm(SLOT, true, 'slot')).toBe('quegli');
  });

  test("feminine: quella / quell' / quelle", () => {
    expect(quelloForm(CASA, false, 'casa')).toBe('quella');
    expect(quelloForm(ALA, false, 'ala')).toBe("quell'");
    expect(quelloForm(ALA, true, 'ali')).toBe('quelle');
  });

  test('agrees with the word that follows: quel grande uomo', () => {
    expect(quelloForm(UOMO, false, 'grande')).toBe('quel');
  });
});
