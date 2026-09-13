import { describe, expect, test } from 'vitest';
import { keinForm } from './keinForm.js';

describe('keinForm', () => {
  test('nominative: kein for masculine and neuter, keine for feminine', () => {
    expect(keinForm('nom', 'masc', false)).toBe('kein');
    expect(keinForm('nom', 'neut', false)).toBe('kein');
    expect(keinForm('nom', 'fem', false)).toBe('keine');
  });

  test('accusative marks only the masculine', () => {
    expect(keinForm('acc', 'masc', false)).toBe('keinen');
    expect(keinForm('acc', 'fem', false)).toBe('keine');
    expect(keinForm('acc', 'neut', false)).toBe('kein');
  });

  test('dative and genitive singular split feminine from masculine/neuter', () => {
    expect(keinForm('dat', 'masc', false)).toBe('keinem');
    expect(keinForm('dat', 'neut', false)).toBe('keinem');
    expect(keinForm('dat', 'fem', false)).toBe('keiner');
    expect(keinForm('gen', 'masc', false)).toBe('keines');
    expect(keinForm('gen', 'fem', false)).toBe('keiner');
  });

  test('the plural ignores gender: keine, keinen in the dative, keiner in the genitive', () => {
    expect(keinForm('nom', 'masc', true)).toBe('keine');
    expect(keinForm('acc', 'neut', true)).toBe('keine');
    expect(keinForm('dat', 'fem', true)).toBe('keinen');
    expect(keinForm('gen', 'masc', true)).toBe('keiner');
  });
});
