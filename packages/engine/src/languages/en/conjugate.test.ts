import { describe, expect, test } from 'vitest';
import { BE, CAN, CAT, EAT, GO, HE, I, MUST, THEY, WE, WILL, YOU } from './en.fixtures.js';
import { conjugate } from './conjugate.js';

describe('conjugate', () => {
  test('takes the present form for the subject’s person and number, by default', () => {
    expect(conjugate(EAT, HE)).toBe('eats');
    expect(conjugate(EAT, I)).toBe('eat');
    expect(conjugate(GO, WE, 'present')).toBe('go');
    expect(conjugate(WILL, HE)).toBe('wants');
  });

  test('a noun subject agrees as the third person', () => {
    expect(conjugate(GO, CAT)).toBe('goes');
    expect(conjugate(GO, { ...CAT, number: 'plural' })).toBe('go');
  });

  test('a single past form serves every person', () => {
    expect(conjugate(EAT, I, 'past')).toBe('ate');
    expect(conjugate(EAT, THEY, 'past')).toBe('ate');
  });

  test('a per-person form wins over the shared one — the copula', () => {
    expect(conjugate(BE, I)).toBe('am');
    expect(conjugate(BE, YOU)).toBe('are');
    expect(conjugate(BE, HE)).toBe('is');
    expect(conjugate(BE, HE, 'past')).toBe('was');
    expect(conjugate(BE, WE, 'past')).toBe('were');
  });

  test('a modal’s suppletive past and future are whole phrases', () => {
    expect(conjugate(MUST, HE)).toBe('must');
    expect(conjugate(MUST, HE, 'past')).toBe('had to');
    expect(conjugate(MUST, I, 'future')).toBe('will have to');
    expect(conjugate(CAN, THEY, 'past')).toBe('could');
    expect(conjugate(CAN, YOU, 'future')).toBe('will be able to');
  });
});
