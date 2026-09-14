import { describe, expect, test } from 'vitest';
import { complement, complements, group, np } from '../languages/resolved.fixtures.js';
import { hasNegativeComplement } from './hasNegativeComplement.js';

const HOUSE = { base: 'house' };

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
});
