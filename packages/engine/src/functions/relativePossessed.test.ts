import { describe, expect, test } from 'vitest';
import { el, np, vp } from '../languages/resolved.fixtures.js';
import type { ResolvedRelativeClause } from '../types.js';
import { relativePossessed } from './relativePossessed.js';

const BOOK = { base: 'book', gender: 'masc' };
const BE = { base: 'be' };

const genitive = (subject = el(np(BOOK, { definiteness: 'definite' }))): ResolvedRelativeClause =>
  ({ headRole: 'possessor', subject, verbPhrase: vp(BE) });

describe('relativePossessed', () => {
  test('gives the possessed phrase article-less — the relativizer stands where the determiner would', () => {
    const possessed = relativePossessed(genitive());
    expect(possessed?.conjuncts[0].head.forms['definiteness']).toBe('bare');
    // The agreement the clause reads is the phrase's own, untouched.
    expect(possessed?.agreement).toEqual(genitive().subject?.agreement);
  });

  test('French asks for the article back, since "dont" leaves the phrase its own', () => {
    expect(relativePossessed(genitive(), 'definite')?.conjuncts[0].head.forms['definiteness']).toBe('definite');
  });

  test('every other gap, and a possessor gap with nothing to possess, come back undefined', () => {
    expect(relativePossessed(undefined)).toBeUndefined();
    expect(relativePossessed({ headRole: 'subject', verbPhrase: vp(BE) })).toBeUndefined();
    expect(relativePossessed({ headRole: 'directObject', subject: el(np(BOOK)), verbPhrase: vp(BE) })).toBeUndefined();
    expect(relativePossessed({ headRole: 'possessor', verbPhrase: vp(BE) })).toBeUndefined();
  });
});
