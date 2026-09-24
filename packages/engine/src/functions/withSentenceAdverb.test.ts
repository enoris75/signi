import { describe, expect, test } from 'vitest';
import { concept } from '../languages/resolved.fixtures.js';
import { withSentenceAdverb } from './withSentenceAdverb.js';

describe('withSentenceAdverb', () => {
  test('a plain adverb leads the clause', () => {
    expect(withSentenceAdverb(concept({ base: 'maybe' }), 'the cat eats')).toBe('maybe the cat eats');
  });

  test('a comma sets it off', () => {
    expect(withSentenceAdverb(concept({ base: 'actually', fronted: 'comma' }), 'the cat eats')).toBe('actually, the cat eats');
  });

  test('que joins it, elided where the language says', () => {
    expect(withSentenceAdverb(concept({ base: 'claro', fronted: 'que' }), 'o gato come')).toBe('claro que o gato come');
    const elide = (c: string) => (/^[aeiou]/.test(c) ? `qu'${c}` : `que ${c}`);
    expect(withSentenceAdverb(concept({ base: 'peut-être', fronted: 'que' }), 'il mange', elide)).toBe("peut-être qu'il mange");
  });
});
