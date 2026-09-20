import { describe, expect, test } from 'vitest';
import { concept } from '../languages/resolved.fixtures.js';
import { agreeingAdverb } from './agreeingAdverb.js';

describe('agreeingAdverb', () => {
  test('the adjective stem of a predicative "adverb"', () => {
    expect(agreeingAdverb(concept({ base: 'juntos', predicative: 'junto' }))).toBe('junto');
  });

  test('nothing for a true adverb, or no adverb at all', () => {
    expect(agreeingAdverb(concept({ base: 'insieme' }))).toBeUndefined();
    expect(agreeingAdverb(concept({ base: 'siempre', subtype: 'frequency' }))).toBeUndefined();
    expect(agreeingAdverb(undefined)).toBeUndefined();
  });
});
