import { describe, expect, test } from 'vitest';
import { buonoForm } from './buonoForm.js';

describe('buonoForm', () => {
  test('masculine singular apocopates to buon, without an apostrophe before a vowel', () => {
    expect(buonoForm('masc', false, 'cane')).toBe('buon');
    expect(buonoForm('masc', false, 'uomo')).toBe('buon');
  });

  test('masculine singular keeps buono before s + consonant or z', () => {
    expect(buonoForm('masc', false, 'spagnolo')).toBe('buono');
    expect(buonoForm('masc', false, 'zaino')).toBe('buono');
  });

  test('the masculine plural is always buoni', () => {
    expect(buonoForm('masc', true, 'cani')).toBe('buoni');
    expect(buonoForm('masc', true, 'uomini')).toBe('buoni');
  });

  test("feminine: buona, buon' before a vowel, buone in the plural", () => {
    expect(buonoForm('fem', false, 'persona')).toBe('buona');
    expect(buonoForm('fem', false, 'azione')).toBe("buon'");
    expect(buonoForm('fem', true, 'azioni')).toBe('buone');
  });
});
