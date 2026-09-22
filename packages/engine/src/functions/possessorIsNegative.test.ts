import { describe, expect, test } from 'vitest';
import { np } from '../languages/resolved.fixtures.js';
import { possessorIsNegative } from './possessorIsNegative.js';

const HOUSE = { base: 'house' };
const MAN = { base: 'man' };
const BOOK = { base: 'book' };

describe('possessorIsNegative', () => {
  test('no possessor, no negative possessor', () => {
    expect(possessorIsNegative(np(HOUSE))).toBe(false);
  });

  // A216: "the house of no man" — the possessor's `no` is a negative word of the phrase.
  test('a no-determined possessor', () => {
    expect(possessorIsNegative(np(HOUSE, {}, { possessor: np(MAN, { definiteness: 'no' }) }))).toBe(true);
  });

  test('a no-determined possessor anywhere down the chain', () => {
    const ofTheHouseOfNoMan = np(BOOK, {}, { possessor: np(HOUSE, {}, { possessor: np(MAN, { definiteness: 'no' }) }) });
    expect(possessorIsNegative(ofTheHouseOfNoMan)).toBe(true);
  });

  test('a possessor under any other determiner', () => {
    for (const definiteness of ['definite', 'indefinite', 'bare', 'this', 'that', 'some', 'many', 'few', 'all']) {
      expect(possessorIsNegative(np(HOUSE, {}, { possessor: np(MAN, { definiteness }) }))).toBe(false);
    }
  });

  // The phrase's own determiner is not its possessor's: "no man's house" reads the head alone.
  test('the phrase\'s own `no` is not read', () => {
    expect(possessorIsNegative(np(HOUSE, { definiteness: 'no' }))).toBe(false);
    expect(possessorIsNegative(np(HOUSE, { definiteness: 'no' }, { possessor: np(MAN) }))).toBe(false);
  });

  test('a pronominal possessor ends the chain', () => {
    expect(possessorIsNegative(np(HOUSE, {}, { possessor: { kind: 'pronominal', person: '3', number: 'singular' } }))).toBe(false);
    const hisNoBook = np(HOUSE, {}, { possessor: np(BOOK, { definiteness: 'no' }, { possessor: { kind: 'pronominal', person: '3', number: 'singular' } }) });
    expect(possessorIsNegative(hisNoBook)).toBe(true);
  });
});
