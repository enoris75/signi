import { describe, expect, test } from 'vitest';
import { HON, NEKO, np, WATASHI } from './ja.fixtures.js';
import { isAnimate } from './isAnimate.js';

describe('isAnimate', () => {
  test('an animal or a pronoun is animate, and so is a group holding one', () => {
    expect(isAnimate([np(NEKO)])).toBe(true);
    expect(isAnimate([np(WATASHI)])).toBe(true);
    expect(isAnimate([np(HON), np(NEKO)])).toBe(true);
  });

  test('a thing is not', () => {
    expect(isAnimate([np(HON)])).toBe(false);
    // SOMETHING has a person for agreement, but stands for a thing (P09-E6 D5).
    expect(isAnimate([np({ base: '何か', person: '3', number: 'singular', thing: '1' })])).toBe(false);
  });
});
