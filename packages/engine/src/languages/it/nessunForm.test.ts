import { describe, expect, test } from 'vitest';
import { nessunForm } from './nessunForm.js';

describe('nessunForm', () => {
  test('masculine nessun before a consonant or a vowel', () => {
    expect(nessunForm('masc', 'gatto')).toBe('nessun');
    expect(nessunForm('masc', 'uomo')).toBe('nessun');
  });

  test('masculine nessuno before s + consonant or z', () => {
    expect(nessunForm('masc', 'slot')).toBe('nessuno');
    expect(nessunForm('masc', 'zaino')).toBe('nessuno');
  });

  test("feminine nessuna, eliding to nessun' before a vowel", () => {
    expect(nessunForm('fem', 'casa')).toBe('nessuna');
    expect(nessunForm('fem', 'ala')).toBe("nessun'");
  });
});
