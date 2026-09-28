import { describe, expect, test } from 'vitest';
import { pronounForm } from './pronounForm.js';
import { AS, GENERIC, JIS, KAZKAS, TU } from './lt.fixtures.js';

describe('pronounForm', () => {
  test('the 1st and 2nd person, singular and plural', () => {
    expect(pronounForm(AS, 'ins')).toBe('manimi');
    expect(pronounForm({ ...AS, number: 'plural', base: 'mes' }, 'acc')).toBe('mus');
    expect(pronounForm(TU, 'acc')).toBe('tave');
    expect(pronounForm({ ...TU, number: 'plural', base: 'jūs' }, 'dat')).toBe('jums');
  });

  test('the 3rd person by gender and number', () => {
    expect(pronounForm(JIS, 'acc')).toBe('jį');
    expect(pronounForm({ ...JIS, gender: 'fem', base: 'ji' }, 'acc')).toBe('ją');
    expect(pronounForm({ ...JIS, gender: 'fem', base: 'ji' }, 'loc')).toBe('joje');
    expect(pronounForm({ ...JIS, number: 'plural', base: 'jie' }, 'acc')).toBe('juos');
    expect(pronounForm({ ...JIS, number: 'plural', gender: 'fem', base: 'jos' }, 'acc')).toBe('jas');
  });

  test('the nominative is the resolved base', () => {
    expect(pronounForm({ ...JIS, gender: 'fem', base: 'ji' }, 'nom')).toBe('ji');
  });

  test('a negated indefinite reads its negative cases', () => {
    expect(pronounForm({ ...KAZKAS, definiteness: 'no', base: 'niekas' }, 'gen')).toBe('nieko');
    expect(pronounForm(KAZKAS, 'gen')).toBe('kažko');
  });

  test('the generic subject is the reflexive outside the nominative', () => {
    expect(pronounForm(GENERIC, 'dat')).toBe('sau');
    expect(pronounForm(GENERIC, 'nom')).toBe('');
  });
});
