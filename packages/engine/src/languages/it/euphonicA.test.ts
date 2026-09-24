import { describe, expect, test } from 'vitest';
import { euphonicA } from './euphonicA.js';

describe('euphonicA', () => {
  test('"a" before a word starting with a is "ad"', () => {
    expect(euphonicA('a', 'abbastanza')).toBe('ad');
    expect(euphonicA('a', 'Amici')).toBe('ad');
  });

  test('"a" before another vowel or a consonant stays "a"', () => {
    expect(euphonicA('a', 'ogni')).toBe('a');
    expect(euphonicA('a', 'un')).toBe('a');
    expect(euphonicA('a', 'parecchi')).toBe('a');
    expect(euphonicA('a', '')).toBe('a');
  });

  test('other prepositions are unchanged', () => {
    expect(euphonicA('da', 'amici')).toBe('da');
    expect(euphonicA('con', 'alcuni')).toBe('con');
  });
});
