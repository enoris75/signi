import { describe, expect, test } from 'vitest';
import { CHAUN, NOVITADS } from './rumgr.fixtures.js';
import { isPlural } from './isPlural.js';

describe('isPlural', () => {
  test('reads the resolved number, else the lexeme count', () => {
    expect(isPlural(CHAUN)).toBe(false);
    expect(isPlural({ ...CHAUN, number: 'plural' })).toBe(true);
    expect(isPlural(NOVITADS)).toBe(true);
  });

  test('nagin takes a singular noun, whatever number was asked for', () => {
    expect(isPlural({ ...CHAUN, number: 'plural', definiteness: 'no' })).toBe(false);
  });

  test('…but a plurale tantum stays plural under nagin', () => {
    expect(isPlural({ ...NOVITADS, definiteness: 'no' })).toBe(true);
  });
});
