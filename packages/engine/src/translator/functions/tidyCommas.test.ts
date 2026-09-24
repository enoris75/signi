import { describe, expect, test } from 'vitest';
import { tidyCommas } from './tidyCommas.js';

describe('tidyCommas', () => {
  test('a trailing comma gives way to the full stop', () => {
    expect(tidyCommas('the cat sees the animals, including the dog,')).toBe('the cat sees the animals, including the dog');
  });

  test('a run of commas collapses to one', () => {
    expect(tidyCommas('the animals, including the dog, , run')).toBe('the animals, including the dog, run');
  });

  test('a sentence with inner commas only is untouched', () => {
    expect(tidyCommas('the animals, including the dog, run')).toBe('the animals, including the dog, run');
  });
});
