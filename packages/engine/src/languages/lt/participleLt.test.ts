import { describe, expect, test } from 'vitest';
import { participleLt } from './participleLt.js';
import { MYLETI, VALGYTI } from './lt.fixtures.js';

describe('participleLt', () => {
  test('the active past agrees with the subject', () => {
    expect(participleLt(VALGYTI, 'past_active', true, { person: '3', plural: false, gender: 'fem' })).toBe('suvalgiusi');
    expect(participleLt(VALGYTI, 'past_active', true, { person: '3', plural: false, gender: 'masc' })).toBe('suvalgęs');
    expect(participleLt(VALGYTI, 'past_active', true, { person: '3', plural: true, gender: 'fem' })).toBe('suvalgiusios');
    expect(participleLt(VALGYTI, 'past_active', true, { person: '1', plural: true, gender: 'masc' })).toBe('suvalgę');
  });

  test('the passive agrees with the patient, in the aspect asked for', () => {
    expect(participleLt(VALGYTI, 'passive', true, { person: '3', plural: false, gender: 'fem' })).toBe('suvalgyta');
    expect(participleLt(VALGYTI, 'passive', false, { person: '3', plural: true, gender: 'masc' })).toBe('valgyti');
    expect(participleLt(VALGYTI, 'passive', true, { person: '3', plural: false, gender: 'neut' })).toBe('suvalgyta');
  });

  test('an unpaired verb has only the imperfective', () => {
    expect(participleLt(MYLETI, 'passive', true, { person: '3', plural: false, gender: 'fem' })).toBe('mylėta');
  });
});
