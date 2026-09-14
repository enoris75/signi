import { describe, expect, test } from 'vitest';
import { complement, np } from '../languages/resolved.fixtures.js';
import { causeSentiment } from './causeSentiment.js';

const RAIN = { base: 'rain' };

describe('causeSentiment', () => {
  test('reads the chosen stance', () => {
    expect(causeSentiment(complement(np(RAIN), [{ kind: 'sentiment', value: 'negative' }]))).toBe('negative');
    expect(causeSentiment(complement(np(RAIN), [{ kind: 'sentiment', value: 'positive' }]))).toBe('positive');
  });

  test('a cause with no sentiment specifier is neutral', () => {
    expect(causeSentiment(complement(np(RAIN)))).toBe('neutral');
    expect(causeSentiment(complement(np(RAIN), [{ kind: 'path', value: 'under' }]))).toBe('neutral');
  });
});
