import { describe, expect, test } from 'vitest';
import { concept } from '../languages/resolved.fixtures.js';
import { negativeAdverb } from './negativeAdverb.js';

// The three shapes the corpus seeds: word only, word + slot, slot only.
const NEANCHE = { base: 'anche', subtype: 'frequency', negative: 'neanche' };
const EITHER = { base: 'also', subtype: 'frequency', negative: 'either', negative_slot: 'final' };
const STILL = { base: 'still', subtype: 'frequency', negative_slot: 'pre-negation' };
const ALWAYS = { base: 'always', subtype: 'frequency' };

describe('negativeAdverb', () => {
  test('a lexeme that names only a word keeps its slot', () => {
    expect(negativeAdverb(concept(NEANCHE), true)).toEqual({ text: 'neanche', slot: undefined });
  });

  test('a lexeme that names both hands back both', () => {
    expect(negativeAdverb(concept(EITHER), true)).toEqual({ text: 'either', slot: 'final' });
  });

  test('a lexeme that names only a slot keeps its word', () => {
    expect(negativeAdverb(concept(STILL), true)).toEqual({ text: 'still', slot: 'pre-negation' });
  });

  test('an affirmative clause changes nothing, whatever the lexeme names', () => {
    expect(negativeAdverb(concept(EITHER), false)).toBeUndefined();
    expect(negativeAdverb(concept(STILL), false)).toBeUndefined();
  });

  test('a lexeme that names neither, and no adverb at all', () => {
    expect(negativeAdverb(concept(ALWAYS), true)).toBeUndefined();
    expect(negativeAdverb(undefined, true)).toBeUndefined();
  });
});
