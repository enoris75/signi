import { describe, expect, test } from 'vitest';
import { TAMTEN, TEN } from './pl.consts.js';
import { pronominalForm } from './pronominalForm.js';

describe('pronominalForm', () => {
  test('agrees in gender and case', () => {
    expect(pronominalForm(TEN, 'nom', { gender: 'fem', plural: false, virile: false, animate: false })).toBe('ta');
    expect(pronominalForm(TEN, 'acc', { gender: 'fem', plural: false, virile: false, animate: false })).toBe('tę');
    expect(pronominalForm(TAMTEN, 'acc', { gender: 'fem', plural: false, virile: false, animate: false })).toBe('tamtą');
  });

  test('the animate masculine accusative is the genitive', () => {
    expect(pronominalForm(TEN, 'acc', { gender: 'masc', plural: false, virile: false, animate: true })).toBe('tego');
    expect(pronominalForm(TEN, 'acc', { gender: 'masc', plural: false, virile: false, animate: false })).toBe('ten');
  });

  test('virile and non-virile plurals', () => {
    expect(pronominalForm(TEN, 'nom', { gender: 'masc', plural: true, virile: true, animate: true })).toBe('ci');
    expect(pronominalForm(TEN, 'nom', { gender: 'masc', plural: true, virile: false, animate: true })).toBe('te');
  });
});
