import { describe, expect, test } from 'vitest';
import { nounForm } from './nounForm.js';
import { KOT, MYSZ, PIENIADZE } from './pl.fixtures.js';

describe('nounForm', () => {
  test('reads the stored case', () => {
    expect(nounForm(KOT, 'gen', false)).toBe('kota');
    expect(nounForm(KOT, 'ins', true)).toBe('kotami');
    expect(nounForm(MYSZ, 'acc', false)).toBe('mysz');
  });

  test('the nominative is base / plural', () => {
    expect(nounForm(KOT, 'nom', false)).toBe('kot');
    expect(nounForm(KOT, 'nom', true)).toBe('koty');
  });

  test('the vocative: voc_sg, and the nominative in the plural', () => {
    expect(nounForm(KOT, 'voc', false)).toBe('kocie');
    expect(nounForm(KOT, 'voc', true)).toBe('koty');
  });

  test('the feminine variant reads the fem_ paradigm', () => {
    const kotka = { ...KOT, gender: 'fem', base: 'kotka' };
    expect(nounForm(kotka, 'nom', false)).toBe('kotka');
    expect(nounForm(kotka, 'acc', false)).toBe('kotkę');
    expect(nounForm(kotka, 'gen', true)).toBe('kotek');
  });

  test('a plurale tantum reads its plural out of the singular keys', () => {
    expect(nounForm(PIENIADZE, 'gen', false)).toBe('pieniędzy');
  });

  test('a missing cell falls back on the nominative', () => {
    expect(nounForm({ base: 'Katze', plural: 'Katzen' }, 'dat', true)).toBe('Katzen');
  });
});
