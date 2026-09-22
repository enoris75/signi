import { describe, expect, test } from 'vitest';
import type { ResolvedNounPhrase } from '../types.js';
import { numeralSuppressesArticle } from './numeralSuppressesArticle.js';

const np = (forms: Record<string, string>, numeral?: number): ResolvedNounPhrase =>
  ({ head: { conceptId: 'CAT', forms }, adjectives: [], nounModifiers: [], numeral });

describe('numeralSuppressesArticle', () => {
  test('the indefinite article gives way to a numeral', () => {
    expect(numeralSuppressesArticle(np({ definiteness: 'indefinite' }, 2))).toBe(true);
    expect(numeralSuppressesArticle(np({ definiteness: 'indefinite' }, 1))).toBe(true);
  });

  test('every other determiner keeps its place, and no numeral changes nothing', () => {
    expect(numeralSuppressesArticle(np({ definiteness: 'definite' }, 2))).toBe(false);
    expect(numeralSuppressesArticle(np({ definiteness: 'this' }, 2))).toBe(false);
    expect(numeralSuppressesArticle(np({ definiteness: 'indefinite' }))).toBe(false);
  });
});
