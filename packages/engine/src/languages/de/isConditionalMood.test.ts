import { describe, expect, test } from 'vitest';
import { isConditionalMood } from './isConditionalMood.js';

describe('isConditionalMood', () => {
  test('is true for either half of a conditional', () => {
    expect(isConditionalMood('conditional')).toBe(true);
    expect(isConditionalMood('subjunctive')).toBe(true);
  });

  test('is false for any other mood, or none', () => {
    expect(isConditionalMood('indicative')).toBe(false);
    expect(isConditionalMood('imperative')).toBe(false);
    expect(isConditionalMood('infinitive')).toBe(false);
    expect(isConditionalMood(undefined)).toBe(false);
  });
});
