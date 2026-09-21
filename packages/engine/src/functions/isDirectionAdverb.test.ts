import { describe, expect, test } from 'vitest';
import { concept } from '../languages/resolved.fixtures.js';
import { isDirectionAdverb } from './isDirectionAdverb.js';

describe('isDirectionAdverb', () => {
  test('an adverb of the direction subtype', () => {
    expect(isDirectionAdverb(concept({ base: 'up', subtype: 'direction' }))).toBe(true);
    expect(isDirectionAdverb(concept({ base: 'nach unten', subtype: 'direction' }))).toBe(true);
  });

  // A place adverb stands where a locative complement does, which is the direction adverb's slot.
  test('an adverb of the place subtype', () => {
    expect(isDirectionAdverb(concept({ base: 'partout', subtype: 'place' }))).toBe(true);
  });

  test('a manner or frequency adverb, or no adverb at all', () => {
    expect(isDirectionAdverb(concept({ base: 'quickly', subtype: 'manner' }))).toBe(false);
    expect(isDirectionAdverb(concept({ base: 'always', subtype: 'frequency' }))).toBe(false);
    expect(isDirectionAdverb(concept({ base: 'well' }))).toBe(false);
    expect(isDirectionAdverb(undefined)).toBe(false);
  });
});
