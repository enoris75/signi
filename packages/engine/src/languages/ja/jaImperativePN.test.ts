import { describe, expect, test } from 'vitest';
import { ANATA, KARE, WATASHI } from './ja.fixtures.js';
import { jaImperativePN } from './jaImperativePN.js';

describe('jaImperativePN', () => {
  test('a second-person addressee is singular or plural by number', () => {
    expect(jaImperativePN(ANATA)).toBe('2sg');
    expect(jaImperativePN({ ...ANATA, number: 'plural' })).toBe('2pl');
  });

  test('a first-person addressee is the cohortative whatever its number', () => {
    expect(jaImperativePN({ ...WATASHI, number: 'plural' })).toBe('1pl');
    expect(jaImperativePN(WATASHI)).toBe('1pl');
  });

  test('any other subject is addressed in the second person by number', () => {
    expect(jaImperativePN(KARE)).toBe('2sg');
    expect(jaImperativePN({ ...KARE, number: 'plural' })).toBe('2pl');
  });

  test('defaults to the second person singular', () => {
    expect(jaImperativePN({})).toBe('2sg');
    expect(jaImperativePN({ number: 'plural' })).toBe('2pl');
  });
});
