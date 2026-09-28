import { describe, expect, test } from 'vitest';
import type { ResolvedVerbPhrase } from '../../types.js';
import { isFrequentative } from './isFrequentative.js';
import { cf } from './lt.fixtures.js';

const vp = (extra: Partial<ResolvedVerbPhrase> = {}): ResolvedVerbPhrase => ({ verb: cf('EAT'), modals: [], ...extra });

describe('isFrequentative', () => {
  test('a past with an adverb of habit', () => {
    expect(isFrequentative(vp({ tense: 'past', modifier: cf('ALWAYS') }))).toBe(true);
    expect(isFrequentative(vp({ tense: 'past', modifier: cf('OFTEN'), aspect: 'progressive' }))).toBe(true);
  });

  test('not in the present, nor without the adverb, nor with a negative one', () => {
    expect(isFrequentative(vp({ modifier: cf('ALWAYS') }))).toBe(false);
    expect(isFrequentative(vp({ tense: 'past' }))).toBe(false);
    expect(isFrequentative(vp({ tense: 'past', modifier: cf('NEVER') }))).toBe(false);
  });

  test('not in another mood or aspect', () => {
    expect(isFrequentative(vp({ tense: 'past', modifier: cf('ALWAYS'), mood: 'conditional' }))).toBe(false);
    expect(isFrequentative(vp({ tense: 'past', modifier: cf('ALWAYS'), aspect: 'resultative' }))).toBe(false);
  });
});
