import { describe, expect, test } from 'vitest';
import { indefArticle } from './indefArticle.js';

const CASES = ['nom', 'acc', 'dat', 'gen'] as const;

describe('indefArticle', () => {
  test('declines ein for each gender', () => {
    expect(CASES.map((c) => indefArticle(c, 'masc', false))).toEqual(['ein', 'einen', 'einem', 'eines']);
    expect(CASES.map((c) => indefArticle(c, 'fem', false))).toEqual(['eine', 'eine', 'einer', 'einer']);
    expect(CASES.map((c) => indefArticle(c, 'neut', false))).toEqual(['ein', 'ein', 'einem', 'eines']);
  });

  test('is empty in the plural', () => {
    expect(CASES.map((c) => indefArticle(c, 'masc', true))).toEqual(['', '', '', '']);
  });
});
