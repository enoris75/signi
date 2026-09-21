import { describe, expect, test } from 'vitest';
import { ESSEN } from './de.fixtures.js';
import { zuInfinitive } from './zuInfinitive.js';

describe('zuInfinitive', () => {
  test('zu before the infinitive', () => {
    expect(zuInfinitive(ESSEN)).toBe('zu essen');
  });

  test('a separable verb takes zu between its particle and its stem, in one word', () => {
    expect(zuInfinitive({ base: 'hinzufügen', particle: 'hinzu' })).toBe('hinzuzufügen');
  });

  // B40: a particle written apart keeps its space on both sides of zu.
  test('a particle written apart takes zu as a word between it and its stem', () => {
    expect(zuInfinitive({ base: 'rückgängig machen', particle: 'rückgängig' })).toBe('rückgängig zu machen');
  });
});
