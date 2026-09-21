import { describe, expect, test } from 'vitest';
import { tonicPhrase } from './tonicPhrase.js';

describe('tonicPhrase', () => {
  test('"em" and "de" fuse with a 3rd-person tonic form', () => {
    expect(tonicPhrase('em', 'ele')).toBe('nele');
    expect(tonicPhrase('em', 'elas')).toBe('nelas');
    expect(tonicPhrase('de', 'ele')).toBe('dele');
    expect(tonicPhrase('de', 'isso')).toBe('disso');
  });

  test('a locution fuses on its own trailing preposition', () => {
    expect(tonicPhrase('debaixo de', 'ela')).toBe('debaixo dela');
    expect(tonicPhrase('longe de', 'eles')).toBe('longe deles');
    expect(tonicPhrase('ao redor de', 'elas')).toBe('ao redor delas');
  });

  test('the 1st and 2nd persons do not fuse', () => {
    expect(tonicPhrase('de', 'mim')).toBe('de mim');
    expect(tonicPhrase('em', 'ti')).toBe('em ti');
    expect(tonicPhrase('debaixo de', 'mim')).toBe('debaixo de mim');
  });

  test('every other preposition simply leads the pronoun', () => {
    expect(tonicPhrase('por', 'ele')).toBe('por ele');
    expect(tonicPhrase('a', 'ele')).toBe('a ele');
    expect(tonicPhrase('como', 'eu')).toBe('como eu');
    expect(tonicPhrase('para', 'elas')).toBe('para elas');
  });
});
