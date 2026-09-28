import { describe, expect, test } from 'vitest';
import { pronounForm } from './pronounForm.js';
import { COS, JA, ON, SIE, TY } from './pl.fixtures.js';

describe('pronounForm', () => {
  test('the 1st and 2nd person, singular and plural', () => {
    expect(pronounForm(JA, 'ins')).toBe('mną');
    expect(pronounForm({ ...JA, number: 'plural', base: 'my' }, 'acc')).toBe('nas');
    expect(pronounForm(TY, 'acc', { short: true })).toBe('cię');
    expect(pronounForm(TY, 'dat')).toBe('tobie');
  });

  test('the 3rd person by gender and number, with its n-form after a preposition', () => {
    expect(pronounForm(ON, 'acc', { short: true })).toBe('go');
    expect(pronounForm(ON, 'gen', { afterPrep: true })).toBe('niego');
    expect(pronounForm({ ...ON, gender: 'fem', base: 'ona' }, 'acc')).toBe('ją');
    expect(pronounForm({ ...ON, gender: 'fem', base: 'ona' }, 'ins', { afterPrep: true })).toBe('nią');
    expect(pronounForm({ ...ON, number: 'plural', base: 'oni' }, 'acc')).toBe('ich');
    expect(pronounForm({ ...ON, number: 'plural', gender: 'fem', base: 'one' }, 'acc')).toBe('je');
  });

  test('the nominative is the resolved base', () => {
    expect(pronounForm({ ...ON, gender: 'fem', base: 'ona' }, 'nom')).toBe('ona');
  });

  test('a negated indefinite reads its negative cases', () => {
    expect(pronounForm({ ...COS, definiteness: 'no', base: 'nic' }, 'gen')).toBe('niczego');
    expect(pronounForm(COS, 'gen')).toBe('czegoś');
  });

  test('the generic się is the reflexive outside the nominative', () => {
    expect(pronounForm(SIE, 'ins')).toBe('sobą');
  });
});
