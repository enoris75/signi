import { describe, expect, test } from 'vitest';
import { afterFirstAux } from './afterFirstAux.js';

describe('afterFirstAux', () => {
  test('puts the adverb after the first word of a two-word group', () => {
    expect(afterFirstAux('must eat', 'always')).toBe('must always eat');
    expect(afterFirstAux('has eaten', 'never')).toBe('has never eaten');
  });

  // A77/A78: negation keeps scope over the adverb.
  test('steps over a not after the first word, and treats cannot as one word', () => {
    expect(afterFirstAux('has not eaten', 'always')).toBe('has not always eaten');
    expect(afterFirstAux('does not have to', 'always')).toBe('does not always have to');
    expect(afterFirstAux("let's not eat", 'always')).toBe("let's not always eat");
    expect(afterFirstAux('cannot', 'always')).toBe('cannot always');
    expect(afterFirstAux('not to eat', 'always')).toBe('not always to eat');
  });

  test('keeps the rest of a longer group together after the adverb', () => {
    expect(afterFirstAux('will be going', 'always')).toBe('will always be going');
    expect(afterFirstAux('will have seen', 'never')).toBe('will never have seen');
  });
});
