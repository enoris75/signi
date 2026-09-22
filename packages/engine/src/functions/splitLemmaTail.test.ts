import { describe, expect, test } from 'vitest';
import { splitLemmaTail } from './splitLemmaTail.js';

describe('splitLemmaTail', () => {
  test('splits a finite form that ends in the tail', () => {
    expect(splitLemmaTail('a besoin', 'besoin')).toEqual(['a', 'besoin']);
    expect(splitLemmaTail('avons besoin', 'besoin')).toEqual(['avons', 'besoin']);
  });

  test('leaves a form without the tail whole: an auxiliary, a modal, a one-word lemma', () => {
    expect(splitLemmaTail('a', 'besoin')).toEqual(['a', '']);
    expect(splitLemmaTail('doit', 'besoin')).toEqual(['doit', '']);
    expect(splitLemmaTail('mange', '')).toEqual(['mange', '']);
  });
});
