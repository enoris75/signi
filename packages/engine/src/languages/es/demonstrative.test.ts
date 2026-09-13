import { describe, expect, test } from 'vitest';
import { AGUA, CASA, GATO } from './es.fixtures.js';
import { demonstrative } from './demonstrative.js';

describe('demonstrative', () => {
  test('the proximal este, agreeing in gender and number', () => {
    expect(demonstrative(false, GATO)).toBe('este');
    expect(demonstrative(false, CASA)).toBe('esta');
    expect(demonstrative(false, GATO, true)).toBe('estos');
    expect(demonstrative(false, CASA, true)).toBe('estas');
  });

  test('the distal ese, agreeing in gender and number', () => {
    expect(demonstrative(true, GATO)).toBe('ese');
    expect(demonstrative(true, CASA)).toBe('esa');
    expect(demonstrative(true, GATO, true)).toBe('esos');
    expect(demonstrative(true, CASA, true)).toBe('esas');
  });

  test('a stressed-a feminine stays feminine', () => {
    // Only el/un take the stressed-a exception: "esta agua", not "este agua".
    expect(demonstrative(false, AGUA)).toBe('esta');
  });
});
