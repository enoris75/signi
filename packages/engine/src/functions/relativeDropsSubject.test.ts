import { describe, expect, test } from 'vitest';
import type { ResolvedNounElement, ResolvedRelativeClause } from '../types.js';
import { el, np, vp } from '../languages/resolved.fixtures.js';
import { relativeDropsSubject } from './relativeDropsSubject.js';

const CAT = { base: 'cat', number: 'singular' };
const BOOK = { base: 'book', number: 'singular' };
const I = { base: 'I', person: '1', number: 'singular' };
const HE = { base: 'he', person: '3', number: 'singular' };
const ONE = { base: 'one', person: '3', number: 'singular', generic: '1' };
const READ = { base: 'read' };

const withRelative = (subject: ResolvedNounElement | undefined, rest: Partial<ResolvedRelativeClause> = {}, head = BOOK) =>
  np(head, {}, { relative: { headRole: 'directObject', ...(subject ? { subject } : {}), verbPhrase: vp(READ), ...rest } });

// A stand-in predicate that conjugates like a Romance present: 1sg "leggo", 3sg "legge", 3pl "leggono".
const conjugated = (agreement: Record<string, string>) =>
  agreement['number'] === 'plural' ? 'leggono' : agreement['person'] === '1' ? 'leggo' : 'legge';
// One that is the same in every person, as a syncretic form is.
const syncretic = () => 'leggerebbe';

describe('relativeDropsSubject', () => {
  test('no relative, a subject relative and a gap with no subject have nothing to drop', () => {
    expect(relativeDropsSubject(np(BOOK), true, conjugated)).toBe(false);
    expect(relativeDropsSubject(withRelative(el(np(I)), { headRole: 'subject' }), true, conjugated)).toBe(false);
    expect(relativeDropsSubject(withRelative(undefined), true, conjugated)).toBe(false);
  });

  test('a noun, a coordination and the impersonal subject are not dropped', () => {
    expect(relativeDropsSubject(withRelative(el(np(CAT))), false, conjugated)).toBe(false);
    expect(relativeDropsSubject(withRelative(el(np(I), np(HE))), false, conjugated)).toBe(false);
    expect(relativeDropsSubject(withRelative(el(np(ONE))), false, conjugated)).toBe(false);
  });

  test('a genitive relative\'s subject is the possessed noun', () => {
    expect(relativeDropsSubject(withRelative(el(np(I)), { headRole: 'possessor' }), false, conjugated)).toBe(false);
  });

  test('after a relativizer that marks the gap, a pronoun drops in every person, unrendered', () => {
    const never = () => { throw new Error('the predicate is not compared'); };
    expect(relativeDropsSubject(withRelative(el(np(I)), { headRole: 'locative' }), false, never)).toBe(true);
    expect(relativeDropsSubject(withRelative(el(np(HE)), { headRole: 'locative' }), false, never)).toBe(true);
  });

  test('after the bare complementizer, a pronoun drops only where its verb differs from the head\'s', () => {
    expect(relativeDropsSubject(withRelative(el(np(I))), true, conjugated)).toBe(true);
    expect(relativeDropsSubject(withRelative(el(np(HE)), {}, CAT), true, conjugated)).toBe(false);
    expect(relativeDropsSubject(withRelative(el(np(HE)), {}, { ...CAT, number: 'plural' }), true, conjugated)).toBe(true);
    expect(relativeDropsSubject(withRelative(el(np(I))), true, syncretic)).toBe(false);
  });
});
