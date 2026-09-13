import { describe, expect, test } from 'vitest';
import { GATTO, TOPO } from './it.fixtures.js';
import { isPlural } from './isPlural.js';

describe('isPlural', () => {
  test('reads the requested number', () => {
    expect(isPlural({ ...GATTO, number: 'plural' })).toBe(true);
    expect(isPlural({ ...GATTO, number: 'singular' })).toBe(false);
  });

  test('falls back to the stored count when no number was requested', () => {
    expect(isPlural(GATTO)).toBe(false);
    expect(isPlural({ ...GATTO, count: 'plural' })).toBe(true);
  });

  test('the requested number wins over the stored count', () => {
    expect(isPlural({ ...GATTO, count: 'plural', number: 'singular' })).toBe(false);
  });

  test('a no-determined phrase is always singular: nessun topo', () => {
    expect(isPlural({ ...TOPO, number: 'plural', definiteness: 'no' })).toBe(false);
  });
});
