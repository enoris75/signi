import { describe, expect, test } from 'vitest';
import { concept } from '../languages/resolved.fixtures.js';
import { isPlaceAdverb } from './isPlaceAdverb.js';

describe('isPlaceAdverb', () => {
  test('an adverb of the place subtype', () => {
    expect(isPlaceAdverb(concept({ base: 'everywhere', subtype: 'place' }))).toBe(true);
    expect(isPlaceAdverb(concept({ base: 'en todas partes', subtype: 'place' }))).toBe(true);
  });

  // A189: the two subtypes no longer share a slot — the particle leads the complements, the place
  // adverb stands among them, where a locative stands.
  test('an adverb of the direction subtype is not one', () => {
    expect(isPlaceAdverb(concept({ base: 'up', subtype: 'direction' }))).toBe(false);
    expect(isPlaceAdverb(concept({ base: 'nach unten', subtype: 'direction' }))).toBe(false);
  });

  test('a manner or frequency adverb, or no adverb at all', () => {
    expect(isPlaceAdverb(concept({ base: 'quickly', subtype: 'manner' }))).toBe(false);
    expect(isPlaceAdverb(concept({ base: 'always', subtype: 'frequency' }))).toBe(false);
    expect(isPlaceAdverb(concept({ base: 'well' }))).toBe(false);
    expect(isPlaceAdverb(undefined)).toBe(false);
  });
});
