import { describe, expect, test } from 'vitest';
import { syllables } from './syllables.js';

describe('syllables', () => {
  test('counts one syllable per vowel group', () => {
    expect(syllables('big')).toBe(1);
    expect(syllables('great')).toBe(1);
    expect(syllables('hidden')).toBe(2);
    expect(syllables('beautiful')).toBe(3);
  });

  test('counts y as a vowel', () => {
    expect(syllables('shy')).toBe(1);
    expect(syllables('happy')).toBe(2);
  });

  test('does not count a silent final e', () => {
    expect(syllables('large')).toBe(1);
    expect(syllables('canine')).toBe(2);
  });

  test('counts a word with no vowel group as one syllable', () => {
    expect(syllables('hmm')).toBe(1);
  });
});
