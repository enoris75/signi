import { describe, expect, test } from 'vitest';
import { CHAT, EFFONDRER, IL, JE, MANGER, ON, TU, VOIR } from './fr.fixtures.js';
import { conjugate } from './conjugate.js';

describe('conjugate', () => {
  test('picks the form by the subject’s person and number, in the present by default', () => {
    expect(conjugate(MANGER, JE)).toBe('mange');
    expect(conjugate(MANGER, TU)).toBe('manges');
    expect(conjugate(MANGER, { ...JE, number: 'plural' })).toBe('mangeons');
    expect(conjugate(VOIR, { ...TU, number: 'plural' })).toBe('voyez');
  });

  test('a noun or generic subject is third person', () => {
    expect(conjugate(VOIR, CHAT)).toBe('voit');
    expect(conjugate(VOIR, { ...CHAT, number: 'plural' })).toBe('voient');
    expect(conjugate(MANGER, ON)).toBe('mange');
  });

  test('takes the stored past and future', () => {
    expect(conjugate(MANGER, IL, 'past')).toBe('mangea');
    expect(conjugate(VOIR, { ...JE, number: 'plural' }, 'future')).toBe('verrons');
  });

  test('a reflexive verb’s clitic rides inside the stored form', () => {
    expect(conjugate(EFFONDRER, JE)).toBe("m'effondre");
    expect(conjugate(EFFONDRER, { ...CHAT, number: 'plural' }, 'future')).toBe("s'effondreront");
  });
});
