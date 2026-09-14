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
});
