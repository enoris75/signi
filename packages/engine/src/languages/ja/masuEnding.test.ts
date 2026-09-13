import { describe, expect, test } from 'vitest';
import { masuEnding } from './masuEnding.js';

describe('masuEnding', () => {
  test('the present takes ます, negative ません', () => {
    expect(masuEnding('present', false)).toBe('ます');
    expect(masuEnding('present', true)).toBe('ません');
  });

  test('the past takes ました, negative ませんでした', () => {
    expect(masuEnding('past', false)).toBe('ました');
    expect(masuEnding('past', true)).toBe('ませんでした');
  });

  // Japanese has no future tense: the non-past covers it (C4).
  test('the future reuses the present', () => {
    expect(masuEnding('future', false)).toBe('ます');
    expect(masuEnding('future', true)).toBe('ません');
  });
});
