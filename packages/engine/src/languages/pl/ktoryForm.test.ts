import { describe, expect, test } from 'vitest';
import { ktoryForm } from './ktoryForm.js';

describe('ktoryForm', () => {
  test('agrees with the head and takes the case of its role', () => {
    expect(ktoryForm('nom', { gender: 'masc', plural: false, virile: false, animate: true })).toBe('który');
    expect(ktoryForm('acc', { gender: 'fem', plural: false, virile: false, animate: false })).toBe('którą');
    expect(ktoryForm('acc', { gender: 'masc', plural: false, virile: false, animate: true })).toBe('którego');
    expect(ktoryForm('nom', { gender: 'masc', plural: true, virile: true, animate: true })).toBe('którzy');
    expect(ktoryForm('loc', { gender: 'masc', plural: false, virile: false, animate: false })).toBe('którym');
  });

  test('kto / co after an indefinite pronoun', () => {
    expect(ktoryForm('nom', { gender: 'masc', plural: false, virile: false, animate: true }, 'kto')).toBe('kto');
    expect(ktoryForm('gen', { gender: 'neut', plural: false, virile: false, animate: false }, 'co')).toBe('czego');
  });
});
