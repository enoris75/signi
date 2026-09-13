import { describe, expect, test } from 'vitest';
import { ELES, EU, GATO } from './pt.fixtures.js';
import { isPlural } from './isPlural.js';

describe('isPlural', () => {
  test('reads the resolved number', () => {
    expect(isPlural({ ...GATO, number: 'plural' })).toBe(true);
    expect(isPlural({ ...GATO, number: 'singular' })).toBe(false);
    expect(isPlural(ELES)).toBe(true);
    expect(isPlural(EU)).toBe(false);
  });

  test('falls back to the lexical count when no number is resolved', () => {
    expect(isPlural(GATO)).toBe(false);
    expect(isPlural({ base: 'gatos', count: 'plural' })).toBe(true);
    expect(isPlural({ ...GATO, count: 'plural', number: 'singular' })).toBe(false);
  });

  test('a no-determined phrase is singular even when plural was requested', () => {
    expect(isPlural({ ...GATO, number: 'plural', definiteness: 'no' })).toBe(false);
  });
});
