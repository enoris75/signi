import { describe, expect, test } from 'vitest';
import { DU, ER, ICH } from './de.fixtures.js';
import { deImperativePN } from './deImperativePN.js';

describe('deImperativePN', () => {
  test('a second-person addressee is du or ihr by number', () => {
    expect(deImperativePN(DU)).toBe('2sg');
    expect(deImperativePN({ ...DU, number: 'plural' })).toBe('2pl');
  });

  test('a first-person addressee is the wir cohortative whatever its number', () => {
    expect(deImperativePN({ ...ICH, number: 'plural' })).toBe('1pl');
    expect(deImperativePN(ICH)).toBe('1pl');
  });

  test('any other subject is addressed as du or ihr by number', () => {
    expect(deImperativePN(ER)).toBe('2sg');
    expect(deImperativePN({ person: '3', number: 'plural' })).toBe('2pl');
  });

  test('defaults to the second person singular', () => {
    expect(deImperativePN({})).toBe('2sg');
    expect(deImperativePN({ number: 'plural' })).toBe('2pl');
  });
});
