import { describe, expect, test } from 'vitest';
import { concept } from '../../languages/resolved.fixtures.js';
import { interrogativeAdverb } from './interrogativeAdverb.js';

const NEVER = { base: 'never', subtype: 'frequency', polarity: 'negative', interrogative: 'ever' };
const KESSHITE = { base: '決して', subtype: 'frequency', polarity: 'negative', reading: 'けっして', interrogative: 'いつか' };
const ALWAYS = { base: 'always', subtype: 'frequency' };

describe('interrogativeAdverb', () => {
  test('a positive question takes the question word, positive, in the same slot', () => {
    expect(interrogativeAdverb(concept(NEVER), true, false)?.forms).toEqual({ base: 'ever', subtype: 'frequency' });
  });

  test('a reading the new surface does not share is dropped', () => {
    expect(interrogativeAdverb(concept(KESSHITE), true, false)?.forms).toEqual({ base: 'いつか', subtype: 'frequency' });
  });

  test('a statement, a negated question and a lexeme with no question form are untouched', () => {
    expect(interrogativeAdverb(concept(NEVER), false, false)?.forms).toEqual(NEVER);
    expect(interrogativeAdverb(concept(NEVER), true, true)?.forms).toEqual(NEVER);
    expect(interrogativeAdverb(concept(ALWAYS), true, false)?.forms).toEqual(ALWAYS);
    expect(interrogativeAdverb(undefined, true, false)).toBeUndefined();
  });
});
