import { describe, expect, test } from 'vitest';
import { inflects } from './inflects.js';

describe('inflects', () => {
  test('a one-syllable adjective inflects', () => {
    expect(inflects('big')).toBe(true);
    expect(inflects('strong')).toBe(true);
    expect(inflects('large')).toBe(true);
  });

  test('a two-syllable adjective ending in -y, a syllabic -le or -ow inflects', () => {
    expect(inflects('happy')).toBe(true);
    expect(inflects('simple')).toBe(true);
    expect(inflects('narrow')).toBe(true);
  });

  // A75: the -le of "fe-male" is not syllabic, and -er inflects only where the lexicon says so.
  test('female and neuter take more / most; an -er adjective inflects only when marked', () => {
    expect(inflects('female')).toBe(false);
    expect(inflects('neuter')).toBe(false);
    expect(inflects('clever', true)).toBe(true);
  });

  test('any other adjective of two syllables or more is periphrastic', () => {
    expect(inflects('hidden')).toBe(false);
    expect(inflects('adult')).toBe(false);
    expect(inflects('beautiful')).toBe(false);
    expect(inflects('interesting')).toBe(false);
  });

  test('a participial adjective is periphrastic whatever its length', () => {
    expect(inflects('tired')).toBe(false);
    expect(inflects('castrated')).toBe(false);
  });
});
