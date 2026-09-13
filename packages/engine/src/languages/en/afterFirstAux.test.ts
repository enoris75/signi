import { describe, expect, test } from 'vitest';
import { afterFirstAux } from './afterFirstAux.js';

describe('afterFirstAux', () => {
  test('puts the adverb after the first word of a two-word group', () => {
    expect(afterFirstAux('must eat', 'always')).toBe('must always eat');
    expect(afterFirstAux('has eaten', 'never')).toBe('has never eaten');
  });

  test('keeps the rest of a longer group together after the adverb', () => {
    expect(afterFirstAux('will be going', 'always')).toBe('will always be going');
    expect(afterFirstAux('will have seen', 'never')).toBe('will never have seen');
  });
});
