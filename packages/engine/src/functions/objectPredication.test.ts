import { describe, expect, test } from 'vitest';
import { complement, np } from '../languages/resolved.fixtures.js';
import { objectPredication } from './objectPredication.js';

const PRISON = { base: 'prison' };

describe('objectPredication', () => {
  test('reads the chosen reading', () => {
    expect(objectPredication(complement(np(PRISON), [{ kind: 'predication', value: 'essive' }]))).toBe('essive');
    expect(objectPredication(complement(np(PRISON), [{ kind: 'predication', value: 'factitive' }]))).toBe('factitive');
  });

  test('an object complement with no predication specifier is factitive', () => {
    expect(objectPredication(complement(np(PRISON)))).toBe('factitive');
    expect(objectPredication(complement(np(PRISON), [{ kind: 'path', value: 'under' }]))).toBe('factitive');
  });
});
