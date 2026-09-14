import { describe, expect, test } from 'vitest';
import { concept } from '../languages/resolved.fixtures.js';
import { isFrequencyAdverb } from './isFrequencyAdverb.js';

describe('isFrequencyAdverb', () => {
  test('an adverb of the frequency subtype', () => {
    expect(isFrequencyAdverb(concept({ base: 'always', subtype: 'frequency' }))).toBe(true);
  });

  test('a manner adverb, or no adverb at all', () => {
    expect(isFrequencyAdverb(concept({ base: 'quickly', subtype: 'manner' }))).toBe(false);
    expect(isFrequencyAdverb(concept({ base: 'well' }))).toBe(false);
    expect(isFrequencyAdverb(undefined)).toBe(false);
  });
});
