import { describe, expect, test } from 'vitest';
import { complement, complements, group, np } from '../languages/resolved.fixtures.js';
import { hasNegativeComplement } from './hasNegativeComplement.js';

const HOUSE = { base: 'house' };
const DOG = { base: 'dog' };
const SPEED = { base: 'speed', mannerRelation: 'measure' };

describe('hasNegativeComplement', () => {
  test('no complements, no negative word', () => {
    expect(hasNegativeComplement(undefined)).toBe(false);
    expect(hasNegativeComplement({})).toBe(false);
  });

  // A33: a postverbal negative word in a complement obliges the Romance preverbal negator.
  test('a no-determined complement', () => {
    expect(hasNegativeComplement(complements({ locative: complement(np(HOUSE, { definiteness: 'no' })) }))).toBe(true);
  });

  test('a no-determined conjunct anywhere in a coordinated complement', () => {
    const houses = group('or', np(HOUSE, { definiteness: 'definite' }), np(HOUSE, { definiteness: 'no' }));
    expect(hasNegativeComplement(complements({ source: complement(houses) }))).toBe(true);
  });

  test('complements under any other determiner', () => {
    expect(hasNegativeComplement(complements({
      locative: complement(np(HOUSE, { definiteness: 'definite' })),
      source: complement(np(HOUSE)),
    }))).toBe(false);
  });

  test('an empty slot in the map is skipped', () => {
    expect(hasNegativeComplement({ locative: undefined })).toBe(false);
    expect(hasNegativeComplement({ locative: undefined, source: complement(np(HOUSE, { definiteness: 'no' })) })).toBe(true);
  });

  // A181: a similative manner phrase is a comparison ("like no dog"), and its negative word stays
  // inside the comparison instead of negating the clause. A noun declaring no manner relation is
  // similative, so it is skipped too; the measure, means and mode relations are not comparisons.
  test('a `no` in a similative manner phrase is not the clause\'s', () => {
    expect(hasNegativeComplement(complements({ manner: complement(np(DOG, { definiteness: 'no' })) }))).toBe(false);
    expect(hasNegativeComplement(complements({ manner: complement(np(DOG, { definiteness: 'no', mannerRelation: 'similative' })) }))).toBe(false);
  });

  test('a `no` under the measure, means and mode relations still negates', () => {
    expect(hasNegativeComplement(complements({ manner: complement(np(SPEED, { definiteness: 'no' })) }))).toBe(true);
    expect(hasNegativeComplement(complements({ manner: complement(np(DOG, { definiteness: 'no', mannerRelation: 'means' })) }))).toBe(true);
    expect(hasNegativeComplement(complements({ manner: complement(np(DOG, { definiteness: 'no', mannerRelation: 'mode' })) }))).toBe(true);
  });

  test('a comparison alongside a negative complement of another type still negates', () => {
    expect(hasNegativeComplement(complements({
      manner: complement(np(DOG, { definiteness: 'no' })),
      locative: complement(np(HOUSE, { definiteness: 'no' })),
    }))).toBe(true);
  });

  test('a conjunct of a coordinated manner group is judged on its own relation', () => {
    const likeNoDogAtNoSpeed = group('and', np(DOG, { definiteness: 'no' }), np(SPEED, { definiteness: 'no' }));
    expect(hasNegativeComplement(complements({ manner: complement(likeNoDogAtNoSpeed) }))).toBe(true);
    const likeNoDogOrNoCat = group('or', np(DOG, { definiteness: 'no' }), np(DOG, { definiteness: 'no' }));
    expect(hasNegativeComplement(complements({ manner: complement(likeNoDogOrNoCat) }))).toBe(false);
  });

  // `countComparisons` puts them back: Japanese needs the clause-final ない to close the どの…も
  // circumfix a similative `no` renders with, so its predicate counts one (A181).
  test('countComparisons puts the comparisons back, for Japanese', () => {
    const likeNoDog = complements({ manner: complement(np(DOG, { definiteness: 'no' })) });
    expect(hasNegativeComplement(likeNoDog, { countComparisons: true })).toBe(true);
    expect(hasNegativeComplement(undefined, { countComparisons: true })).toBe(false);
    expect(hasNegativeComplement(complements({ manner: complement(np(DOG)) }), { countComparisons: true })).toBe(false);
  });
});
