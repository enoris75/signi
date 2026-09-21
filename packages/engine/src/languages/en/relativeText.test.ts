import { describe, expect, test } from 'vitest';
import type { ResolvedRelativeClause } from '../../types.js';
import {
  BOOK, BOY, CAT, complement, CRY, DOG, EAT, el, GIVE, HOUSE, I, MAN, MOUSE, np, ONE, READ, RUN, SEE, vp, WOMAN,
} from './en.fixtures.js';
import { relativeText } from './relativeText.js';

const subjectRelative = (verbPhrase: ResolvedRelativeClause['verbPhrase'], rest: Partial<ResolvedRelativeClause> = {}): ResolvedRelativeClause =>
  ({ headRole: 'subject', verbPhrase, ...rest });

describe('relativeText', () => {
  test('is empty without a relative clause', () => {
    expect(relativeText(np(CAT))).toBe('');
  });

  test('a subject relative leaves the head as its subject and agrees with it', () => {
    expect(relativeText(np(CAT, {}, { relative: subjectRelative(vp(EAT), { directObject: el(np(MOUSE)) }) }))).toBe('that eats the mouse');
    expect(relativeText(np(CAT, { number: 'plural' }, { relative: subjectRelative(vp(EAT)) }))).toBe('that eat');
  });

  // English relativises on personhood, not animacy: an animal still takes "that".
  test('who for a person, that for anything else', () => {
    expect(relativeText(np(BOY, {}, { relative: subjectRelative(vp(CRY)) }))).toBe('who cries');
    expect(relativeText(np(CAT, {}, { relative: subjectRelative(vp(CRY)) }))).toBe('that cries');
    expect(relativeText(np(BOOK, {}, { relative: subjectRelative(vp(READ, { negative: true })) }))).toBe('that does not read');
  });

  test('a relative with no subject of its own is read as a subject relative', () => {
    expect(relativeText(np(CAT, {}, { relative: { headRole: 'directObject', verbPhrase: vp(EAT) } }))).toBe('that eats');
  });

  test('a non-subject relative renders its own subject, which drives agreement', () => {
    const readBy = (subject: ReturnType<typeof el>) =>
      relativeText(np(BOOK, {}, { relative: { headRole: 'directObject', subject, verbPhrase: vp(READ) } }));
    expect(readBy(el(np(I)))).toBe('that I read');
    expect(readBy(el(np(DOG)))).toBe('that the dog reads');
    expect(readBy(el(np(DOG), np(CAT)))).toBe('that the dog and the cat read');
  });

  // A166: a non-subject relative's own `no` subject is this clause's negator, as in the main clause,
  // so the verb's "not" goes and a second `no` phrase falls to "any". A `no` HEAD negates the matrix
  // clause instead, and a genitive relative's possessed phrase has lost its determiner to "whose".
  test('the clause\'s own `no` subject takes the "not" and a `no` phrase with it; a `no` head does not', () => {
    const noCat = el(np(CAT, { definiteness: 'no' }));
    expect(relativeText(np(MOUSE, {}, { relative: { headRole: 'directObject', subject: noCat, verbPhrase: vp(EAT, { negative: true }) } })))
      .toBe('that no cat eats');
    expect(relativeText(np(HOUSE, {}, {
      relative: { headRole: 'locative', subject: noCat, verbPhrase: vp(EAT), directObject: el(np(MOUSE, { definiteness: 'no' })) },
    }))).toBe('where no cat eats any mouse');
    expect(relativeText(np(CAT, { definiteness: 'no' }, { relative: subjectRelative(vp(EAT, { negative: true })) })))
      .toBe('that does not eat');
    expect(relativeText(np(BOY, {}, { relative: { headRole: 'possessor', subject: noCat, verbPhrase: vp(EAT, { negative: true }) } })))
      .toBe('whose cat does not eat');
  });

  test('a person head keeps who in an object relative', () => {
    expect(relativeText(np(BOY, {}, { relative: { headRole: 'directObject', subject: el(np(MAN)), verbPhrase: vp(SEE) } })))
      .toBe('who the man sees');
  });

  test('the clause carries its own tense, aspect and complements', () => {
    expect(relativeText(np(CAT, {}, { relative: subjectRelative(vp(EAT, { aspect: 'resultative' })) }))).toBe('that has eaten');
    expect(relativeText(np(CAT, { number: 'plural' }, { relative: subjectRelative(vp(EAT, { tense: 'future' })) }))).toBe('that will eat');
    expect(relativeText(np(DOG, {}, { relative: subjectRelative(vp(RUN), { complements: { locative: complement(np(HOUSE)) } }) })))
      .toBe('that runs in the house');
  });

  test('a head filling a complement takes its preposition, with whom for a person and which otherwise', () => {
    expect(relativeText(np(HOUSE, {}, {
      relative: { headRole: 'locative', subject: el(np(CAT)), verbPhrase: vp(EAT), headSpecifiers: [{ kind: 'path', value: 'under' }] },
    }))).toBe('under which the cat eats');
    expect(relativeText(np(WOMAN, {}, { relative: { headRole: 'terminus', subject: el(np(MAN)), verbPhrase: vp(GIVE), directObject: el(np(BOOK)) } })))
      .toBe('to whom the man gives the book');
  });

  // C07: the plain place takes the relative adverb, not "in which".
  test('a plain locative gap is where, whether or not the default relation was chosen', () => {
    const eatsIn = (rest: Partial<ResolvedRelativeClause> = {}) =>
      relativeText(np(HOUSE, {}, { relative: { headRole: 'locative', subject: el(np(CAT)), verbPhrase: vp(EAT), ...rest } }));
    expect(eatsIn()).toBe('where the cat eats');
    expect(eatsIn({ headSpecifiers: [{ kind: 'path', value: 'in' }] })).toBe('where the cat eats');
    expect(eatsIn({ subject: el(np(ONE)), verbPhrase: vp(EAT, { negative: true }) })).toBe('where one does not eat');
    expect(eatsIn({ headSpecifiers: [{ kind: 'path', value: 'behind' }] })).toBe('behind which the cat eats');
    expect(relativeText(np(HOUSE, { number: 'plural' }, { relative: { headRole: 'locative', subject: el(np(I)), verbPhrase: vp(EAT) } })))
      .toBe('where I eat');
  });
});
