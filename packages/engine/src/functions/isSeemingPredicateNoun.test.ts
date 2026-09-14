import { describe, expect, test } from 'vitest';
import { complement, group, np } from '../languages/resolved.fixtures.js';
import { isSeemingPredicateNoun } from './isSeemingPredicateNoun.js';

const SEEM = { base: 'seem', seeming: '1' };
const BECOME = { base: 'become' };
const LEGEND = { base: 'legend', role: 'noun' };
const TIRED = { base: 'tired', role: 'adjective' };

describe('isSeemingPredicateNoun', () => {
  // A46: English and German add an infinitival copula to a predicate noun under SEEM.
  test('a predicate noun under a seeming verb', () => {
    expect(isSeemingPredicateNoun(complement(np(LEGEND)), SEEM)).toBe(true);
  });

  test('a predicate adjective stays bare under a seeming verb', () => {
    expect(isSeemingPredicateNoun(complement(np(TIRED)), SEEM)).toBe(false);
  });

  test('a predicate noun under any other verb', () => {
    expect(isSeemingPredicateNoun(complement(np(LEGEND)), BECOME)).toBe(false);
  });

  test('one noun conjunct in a coordinated predicate is enough', () => {
    expect(isSeemingPredicateNoun(complement(group('and', np(TIRED), np(LEGEND))), SEEM)).toBe(true);
  });
});
