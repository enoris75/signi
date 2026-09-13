import { describe, expect, test } from 'vitest';
import { BOOK, BOY, CAT, EAT, el, MAN, np, READ, vp } from './en.fixtures.js';
import { isPostModified } from './isPostModified.js';

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

  test('its own relative counts even when its possessor has none', () => {
    const relative = { headRole: 'directObject' as const, subject: el(np(MAN)), verbPhrase: vp(READ) };
    expect(isPostModified(np(BOOK, {}, { possessor: np(BOY), relative }))).toBe(true);
  });
});
