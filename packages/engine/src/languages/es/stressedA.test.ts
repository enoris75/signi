import { describe, expect, test } from 'vitest';
import { AGUA, CASA, GATO } from './es.fixtures.js';
import { stressedA } from './stressedA.js';

describe('stressedA', () => {
  test('a marked stressed-a noun takes the exception in the singular', () => {
    expect(stressedA(AGUA, false)).toBe(true);
  });

  test('the exception lapses in the plural', () => {
    expect(stressedA(AGUA, true)).toBe(false);
  });

  test('an unmarked noun never takes it', () => {
    expect(stressedA(CASA, false)).toBe(false);
    expect(stressedA(GATO, false)).toBe(false);
  });
});
