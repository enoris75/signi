import { describe, expect, test } from 'vitest';
import { GATO, RATON } from './es.fixtures.js';
import { isPlural } from './isPlural.js';

describe('isPlural', () => {
  test('reads the resolved number', () => {
    expect(isPlural({ ...GATO, number: 'plural' })).toBe(true);
    expect(isPlural({ ...GATO, number: 'singular' })).toBe(false);
  });

  test('falls back to the lexical count when no number was resolved', () => {
    expect(isPlural(GATO)).toBe(false);
    expect(isPlural({ ...GATO, count: 'plural' })).toBe(true);
  });

  test('the resolved number wins over the count', () => {
    expect(isPlural({ ...GATO, count: 'plural', number: 'singular' })).toBe(false);
  });

  test('a no-determined phrase is always singular', () => {
    // "ningún ratón", never "ningún ratones": ninguno has no plural.
    expect(isPlural({ ...RATON, number: 'plural', definiteness: 'no' })).toBe(false);
    expect(isPlural({ ...RATON, number: 'plural', definiteness: 'some' })).toBe(true);
  });
});
