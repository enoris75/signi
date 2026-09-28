import { describe, expect, test } from 'vitest';
import { SIS, TAS } from './lt.consts.js';
import { pronominalForm } from './pronominalForm.js';

describe('pronominalForm', () => {
  test('agrees in gender, number and case', () => {
    expect(pronominalForm(SIS, 'nom', { gender: 'fem', plural: false })).toBe('ši');
    expect(pronominalForm(SIS, 'acc', { gender: 'masc', plural: false })).toBe('šį');
    expect(pronominalForm(TAS, 'loc', { gender: 'fem', plural: true })).toBe('tose');
    expect(pronominalForm(TAS, 'nom', { gender: 'masc', plural: true })).toBe('tie');
  });

  test('a genderless head reads the masculine; the vocative the nominative', () => {
    expect(pronominalForm(TAS, 'gen', { gender: 'neut', plural: false })).toBe('to');
    expect(pronominalForm(TAS, 'voc', { gender: 'fem', plural: false })).toBe('ta');
  });
});
