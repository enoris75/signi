import { describe, expect, test } from 'vitest';
import type { ResolvedNounPhrase } from '../types.js';
import { adj, complement, concept, nounModifier, np, vp, type Forms } from '../languages/resolved.fixtures.js';
import { locativeIdiom } from './locativeIdiom.js';

const HOME = { base: 'home' };
const IDIOMS = { HOME: 'at home' };

/** A noun phrase headed by the HOME concept, which the idiom table is keyed by. */
function home(extra: Forms = {}, rest: Partial<Omit<ResolvedNounPhrase, 'head'>> = {}): ResolvedNounPhrase {
  return { ...np(HOME, extra, rest), head: concept({ ...HOME, ...extra }, 'HOME') };
}

const idiom = (phrase: ResolvedNounPhrase, c = complement(phrase)) => locativeIdiom(c, phrase, IDIOMS);

describe('locativeIdiom', () => {
  // A41: "at home", "a casa", "zu Hause".
  test('plain containment on the definite or bare singular noun takes the idiom', () => {
    expect(idiom(home({ definiteness: 'definite' }))).toBe('at home');
    expect(idiom(home({ definiteness: 'bare' }))).toBe('at home');
    expect(idiom(home({ number: 'singular' }))).toBe('at home');
  });

  test('a noun with no idiom in the table is an ordinary place', () => {
    expect(idiom(np(HOME, { definiteness: 'definite' }))).toBeUndefined();
  });

  test('only containment: a chosen `in` keeps the idiom, any other relation drops it', () => {
    const phrase = home();
    expect(idiom(phrase, complement(phrase, [{ kind: 'path', value: 'in' }]))).toBe('at home');
    expect(idiom(phrase, complement(phrase, [{ kind: 'path', value: 'under' }]))).toBeUndefined();
  });

  test.each(['indefinite', 'this', 'no', 'all'])('a marked determiner (%s) makes it a place', (definiteness) => {
    expect(idiom(home({ definiteness }))).toBeUndefined();
  });

  test('a plural, by number or by count, makes it a place', () => {
    expect(idiom(home({ number: 'plural' }))).toBeUndefined();
    expect(idiom(home({ count: 'plural' }))).toBeUndefined();
  });

  test.each<[string, Partial<Omit<ResolvedNounPhrase, 'head'>>]>([
    ['an adjective', { adjectives: [adj({ base: 'old' })] }],
    ['an attributive noun', { nounModifiers: [nounModifier({ base: 'holiday' })] }],
    ['a possessor', { possessor: { kind: 'pronominal', person: '1', number: 'singular' } }],
    ['a relative clause', { relative: { headRole: 'subject', verbPhrase: vp({ base: 'burn' }) } }],
  ])('%s makes it a place', (_, rest) => {
    expect(idiom(home({}, rest))).toBeUndefined();
  });
});
