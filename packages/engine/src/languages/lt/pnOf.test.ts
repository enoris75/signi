import { describe, expect, test } from 'vitest';
import { pnOf } from './pnOf.js';

describe('pnOf', () => {
  test('person and number', () => {
    expect(pnOf({ person: '1', plural: false, gender: 'masc' })).toBe('1sg');
    expect(pnOf({ person: '3', plural: true, gender: 'fem' })).toBe('3pl');
  });
});
