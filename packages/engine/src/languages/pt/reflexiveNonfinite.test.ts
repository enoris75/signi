import { describe, expect, test } from 'vitest';
import { reflexiveNonfinite } from './reflexiveNonfinite.js';

const MOVER_SE = { base: 'mover-se', gerund: 'movendo-se', participle: 'movido' };
const COMER = { base: 'comer', gerund: 'comendo', participle: 'comido' };
const subject = (person: string, number = 'singular') => ({ person, number });

describe('reflexiveNonfinite', () => {
  test('the stored "-se" is replaced by the subject’s clitic', () => {
    expect(reflexiveNonfinite('mover-se', MOVER_SE, subject('1'))).toBe('mover-me');
    // The 2nd person is the "você" paradigm (A108), which takes the 3rd-person clitic.
    expect(reflexiveNonfinite('mover-se', MOVER_SE, subject('2'))).toBe('mover-se');
    expect(reflexiveNonfinite('mover-se', MOVER_SE, subject('3'))).toBe('mover-se');
    expect(reflexiveNonfinite('mover-se', MOVER_SE, subject('1', 'plural'))).toBe('mover-nos');
  });

  test('the gerund takes it the same way', () => {
    expect(reflexiveNonfinite('movendo-se', MOVER_SE, subject('1'))).toBe('movendo-me');
    expect(reflexiveNonfinite('movendo-se', MOVER_SE, subject('3', 'plural'))).toBe('movendo-se');
  });

  test('a form with no "-se" takes the clitic too — "ter" in the perfect', () => {
    expect(reflexiveNonfinite('ter', MOVER_SE, subject('3'))).toBe('ter-se');
    expect(reflexiveNonfinite('ter', MOVER_SE, subject('1'))).toBe('ter-me');
  });

  test('a non-reflexive verb is returned as it is', () => {
    expect(reflexiveNonfinite('comer', COMER, subject('1'))).toBe('comer');
    expect(reflexiveNonfinite('ter', COMER, subject('1'))).toBe('ter');
  });
});
