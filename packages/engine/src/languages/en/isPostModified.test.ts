import { describe, expect, test } from 'vitest';
import { BOOK, BOY, CAT, EAT, el, EUROPE, MAN, np, READ, vp } from './en.fixtures.js';
import { isPostModified, keepsHeadDeterminer } from './isPostModified.js';

const catThatEats = np(CAT, {}, { relative: { headRole: 'subject', verbPhrase: vp(EAT) } });

describe('isPostModified', () => {
  test('a plain noun phrase is not post-modified', () => {
    expect(isPostModified(np(CAT))).toBe(false);
  });

  test('a relative clause post-modifies its noun phrase', () => {
    expect(isPostModified(catThatEats)).toBe(true);
  });

  test('post-modification propagates up a chain of genitive possessors', () => {
    expect(isPostModified(np(BOY, {}, { possessor: catThatEats }))).toBe(true);
    expect(isPostModified(np(BOOK, {}, { possessor: np(BOY, {}, { possessor: catThatEats }) }))).toBe(true);
  });

  test('a possessor without a relative clause does not', () => {
    expect(isPostModified(np(BOOK, {}, { possessor: np(BOY) }))).toBe(false);
  });

  test('a pronominal possessor never does', () => {
    expect(isPostModified(np(BOOK, {}, { possessor: { kind: 'pronominal', person: '3', number: 'singular' } }))).toBe(false);
  });

  // A187: unless the head kept its determiner, which sends the possessive to "of hers" — an
  // of-phrase like any other, so "'s" cannot follow it either.
  test('a pronominal possessor does once the head keeps its determiner', () => {
    const hers = { kind: 'pronominal', person: '3', number: 'singular', gender: 'fem' } as const;
    expect(isPostModified(np(BOOK, { definiteness: 'this' }, { possessor: hers }))).toBe(true);
    expect(isPostModified(np(BOOK, { definiteness: 'all' }, { possessor: hers }))).toBe(false); // "all her books"
  });

  test('its own relative counts even when its possessor has none', () => {
    const relative = { headRole: 'directObject' as const, subject: el(np(MAN)), verbPhrase: vp(READ) };
    expect(isPostModified(np(BOOK, {}, { possessor: np(BOY), relative }))).toBe(true);
  });

  // A184: a phrase that keeps its own determiner is rendered with a trailing of-phrase, so it is
  // post-modified for anything above it — "the book of this father of the cat", never "'s".
  test('a possessor that keeps its own determiner is post-modified', () => {
    expect(isPostModified(np(BOOK, {}, { possessor: np(BOY, { definiteness: 'this' }, { possessor: np(CAT) }) }))).toBe(true);
    expect(isPostModified(np(BOY, { definiteness: 'this' }, { possessor: np(CAT) }))).toBe(true);
    // Without a possessor there is no of-phrase to trip over.
    expect(isPostModified(np(BOY, { definiteness: 'this' }))).toBe(false);
    // "all" stacks in front of the clitic instead, so it leaves nothing trailing.
    expect(isPostModified(np(BOY, { definiteness: 'all' }, { possessor: np(CAT) }))).toBe(false);
  });

  // C26: a whole or the parts always follow the head as an of-phrase, so "'s" cannot follow them —
  // "the name of a part of a keyboard", never "a part of a keyboard's name".
  test('a partitive possessor is post-modified, whatever the determiner', () => {
    expect(isPostModified(np(BOOK, {}, { possessor: np(CAT), possessorRole: 'whole' }))).toBe(true);
    expect(isPostModified(np(BOOK, { definiteness: 'all' }, { possessor: np(CAT), possessorRole: 'parts' }))).toBe(true);
    expect(isPostModified(np(BOOK, {}, { possessor: np(CAT), possessorRole: 'owner' }))).toBe(false);
  });
});

describe('keepsHeadDeterminer', () => {
  test('a demonstrative, a quantifier, `no` and the NPI `any` are kept', () => {
    for (const definiteness of ['this', 'that', 'some', 'many', 'few', 'no', 'any']) {
      expect(keepsHeadDeterminer({ ...BOOK, definiteness })).toBe(true);
    }
  });

  test('the determiners the Saxon genitive can carry are not', () => {
    for (const definiteness of ['definite', 'indefinite', 'bare', 'all']) {
      expect(keepsHeadDeterminer({ ...BOOK, definiteness })).toBe(false);
    }
    expect(keepsHeadDeterminer(BOOK)).toBe(false); // no `definiteness` at all → definite
  });

  test('a proper name has no article to lose', () => {
    expect(keepsHeadDeterminer({ ...EUROPE, definiteness: 'this' })).toBe(false);
  });
});
