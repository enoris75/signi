import { describe, expect, test } from 'vitest';
import { complement, complements, group, np } from '../languages/resolved.fixtures.js';
import { hasNegativePossessorComplement } from './hasNegativePossessorComplement.js';

const HOUSE = { base: 'house' };
const MAN = { base: 'man' };
const SPEED = { base: 'speed', mannerRelation: 'measure' };
const noMansHouse = np(HOUSE, {}, { possessor: np(MAN, { definiteness: 'no' }) });

describe('hasNegativePossessorComplement', () => {
  test('no complements, no negative possessor', () => {
    expect(hasNegativePossessorComplement(undefined)).toBe(false);
    expect(hasNegativePossessorComplement({})).toBe(false);
    expect(hasNegativePossessorComplement({ locative: undefined })).toBe(false);
  });

  // A216: "nella casa di nessun uomo" obliges the Romance preverbal negator.
  test('a complement whose possessor is no-determined', () => {
    expect(hasNegativePossessorComplement(complements({ locative: complement(noMansHouse) }))).toBe(true);
  });

  test('a negative possessor on any conjunct of a coordinated complement', () => {
    expect(hasNegativePossessorComplement(complements({ source: complement(group('or', np(HOUSE), noMansHouse)) }))).toBe(true);
  });

  // The complement's own `no` is `hasNegativeComplement`'s to read.
  test('a complement\'s own `no`, or a positive possessor, is not one', () => {
    expect(hasNegativePossessorComplement(complements({ locative: complement(np(HOUSE, { definiteness: 'no' })) }))).toBe(false);
    expect(hasNegativePossessorComplement(complements({ locative: complement(np(HOUSE, {}, { possessor: np(MAN) })) }))).toBe(false);
  });

  // A181: a comparison licenses its own negative word, "come la casa di nessun uomo".
  test('a similative manner phrase is skipped, and the other relations are not', () => {
    expect(hasNegativePossessorComplement(complements({ manner: complement(noMansHouse) }))).toBe(false);
    const atNoMansSpeed = np(SPEED, {}, { possessor: np(MAN, { definiteness: 'no' }) });
    expect(hasNegativePossessorComplement(complements({ manner: complement(atNoMansSpeed) }))).toBe(true);
  });

  test('countComparisons puts the comparisons back, for Japanese', () => {
    expect(hasNegativePossessorComplement(complements({ manner: complement(noMansHouse) }), { countComparisons: true })).toBe(true);
    expect(hasNegativePossessorComplement(complements({ manner: complement(np(HOUSE)) }), { countComparisons: true })).toBe(false);
  });
});
