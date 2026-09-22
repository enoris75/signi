import { describe, expect, test } from 'vitest';
import { DENSETSU, DESU, el, HITO_GENERIC, HON, IE, INU, KABE, MIZU, MOTSU, NEKO, NOMU, np, vp, WATASHI, YOMU } from './ja.fixtures.js';
import { relativeClauseSegs } from './relativeClauseSegs.js';

const text = (segs: { t: string }[]) => segs.map((s) => s.t).join('');

// The clause alone, without the head it precedes: what `npSegs` puts before the noun, and what a
// headless relative-clause gloss says by itself (see NounPhrase.relativeGloss).
describe('relativeClauseSegs', () => {
  test('is empty without a relative clause', () => {
    expect(relativeClauseSegs(np(NEKO))).toEqual([]);
  });

  test('a subject relative is its predicate in the plain form, and no head', () => {
    const drinks = { headRole: 'subject' as const, verbPhrase: vp(NOMU), directObject: el(np(MIZU)) };
    expect(relativeClauseSegs(np(NEKO, {}, { relative: drinks }))).toEqual([
      { t: '水', r: 'みず' },
      { t: 'を' },
      { t: '飲む', r: 'のむ' },
    ]);
    expect(text(relativeClauseSegs(np(NEKO, {}, { relative: { ...drinks, verbPhrase: vp(NOMU, { tense: 'past' }) } })))).toBe('水を飲んだ');
  });

  test('a non-subject relative leads with its own subject and が, and drops a generic one', () => {
    const iRead = { headRole: 'directObject' as const, subject: el(np(WATASHI)), verbPhrase: vp(YOMU) };
    expect(text(relativeClauseSegs(np(HON, {}, { relative: iRead })))).toBe('私が読む');
    const oneReads = { headRole: 'directObject' as const, subject: el(np(HITO_GENERIC)), verbPhrase: vp(YOMU) };
    expect(text(relativeClauseSegs(np(HON, {}, { relative: oneReads })))).toBe('読む');
  });

  // A150: an inanimate owner's possession is the existential, the owner marked に.
  test('an inanimate owner is marked に', () => {
    const theHouseHas = { headRole: 'directObject' as const, subject: el(np(IE)), verbPhrase: vp(MOTSU) };
    expect(text(relativeClauseSegs(np(KABE, {}, { relative: theHouseHas })))).toBe('家にある');
  });

  // A217: the head fills the object's gap, so it is what exists, and picks いる or ある.
  test('an animate head the owner has takes いる', () => {
    const theHouseHas = { headRole: 'directObject' as const, subject: el(np(IE)), verbPhrase: vp(MOTSU) };
    expect(text(relativeClauseSegs(np(NEKO, {}, { relative: theHouseHas })))).toBe('家にいる');
    // A relative on the owner keeps the object in the clause, and reads it there.
    const hasACat = { headRole: 'subject' as const, verbPhrase: vp(MOTSU), directObject: el(np(NEKO)) };
    expect(text(relativeClauseSegs(np(IE, {}, { relative: hasACat })))).toBe('猫がいる');
  });

  // A123: a head filling the copula's subject complement leaves a gap filled with そう.
  test('a gap on the copula\'s subject complement is filled with そう', () => {
    const theDogIs = { headRole: 'predicative' as const, subject: el(np(INU)), verbPhrase: vp(DESU, { negative: true }) };
    expect(text(relativeClauseSegs(np(DENSETSU, {}, { relative: theDogIs })))).toBe('犬がそうではない');
  });
});
