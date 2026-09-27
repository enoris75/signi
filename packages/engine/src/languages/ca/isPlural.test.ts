import { describe, expect, test } from 'vitest';
import { DINERS, GAT } from './ca.fixtures.js';
import { isPlural } from './isPlural.js';

describe('isPlural', () => {
  test('reads the phrase\'s number, then the noun\'s count', () => {
    expect(isPlural({ ...GAT, number: 'plural' })).toBe(true);
    expect(isPlural(GAT)).toBe(false);
    expect(isPlural(DINERS)).toBe(true);
  });

  test('cap takes the singular, but for a plurale tantum', () => {
    expect(isPlural({ ...GAT, number: 'plural', definiteness: 'no' })).toBe(false);
    expect(isPlural({ ...DINERS, definiteness: 'no' })).toBe(true);
  });
});
