import { describe, expect, test } from 'vitest';
import { complement, el, np } from '../languages/resolved.fixtures.js';
import { isAdjectivePredicate } from './isAdjectivePredicate.js';

const BEAUTIFUL = { base: 'beautiful', role: 'adjective' };
const HAPPY = { base: 'happy', role: 'adjective' };
const PRISON = { base: 'prison', role: 'noun' };

describe('isAdjectivePredicate', () => {
  test('an adjective head takes no factitive link — "makes the house beautiful"', () => {
    expect(isAdjectivePredicate(complement(np(BEAUTIFUL)))).toBe(true);
    expect(isAdjectivePredicate(complement(el(np(BEAUTIFUL), np(HAPPY))))).toBe(true);
  });

  test('a noun head needs one, and so does a group holding one', () => {
    expect(isAdjectivePredicate(complement(np(PRISON)))).toBe(false);
    expect(isAdjectivePredicate(complement(el(np(BEAUTIFUL), np(PRISON))))).toBe(false);
  });
});
