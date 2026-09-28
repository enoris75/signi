import { describe, expect, test } from 'vitest';
import { nounForm } from './nounForm.js';
import { KATE, MOKYTOJAS, NAMAS, PINIGAI, SUO } from './lt.fixtures.js';

describe('nounForm', () => {
  test('reads the stored case', () => {
    expect(nounForm(KATE, 'gen', true)).toBe('kačių');
    expect(nounForm(NAMAS, 'loc', true)).toBe('namuose');
    expect(nounForm(NAMAS, 'loc', false)).toBe('name');
    expect(nounForm(SUO, 'gen', false)).toBe('šuns');
  });

  test('the nominative is base / plural', () => {
    expect(nounForm(KATE, 'nom', false)).toBe('katė');
    expect(nounForm(KATE, 'nom', true)).toBe('katės');
  });

  test('the vocative: voc_sg, and the nominative in the plural', () => {
    expect(nounForm(SUO, 'voc', false)).toBe('šunie');
    expect(nounForm(SUO, 'voc', true)).toBe('šunys');
  });

  test('the feminine variant reads the fem_ paradigm', () => {
    const she = { ...MOKYTOJAS, gender: 'fem' };
    expect(nounForm(she, 'nom', false)).toBe('mokytoja');
    expect(nounForm(she, 'acc', false)).toBe('mokytoją');
    expect(nounForm(she, 'gen', true)).toBe('mokytojų');
  });

  test('a plurale tantum reads its plural out of the singular keys', () => {
    expect(nounForm(PINIGAI, 'gen', false)).toBe('pinigų');
  });

  test('a missing cell falls back on the nominative', () => {
    expect(nounForm({ base: 'kivi', plural: 'kivi' }, 'dat', true)).toBe('kivi');
  });
});
