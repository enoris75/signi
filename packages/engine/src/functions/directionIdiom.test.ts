import { describe, expect, test } from 'vitest';
import type { ResolvedNounPhrase } from '../types.js';
import { adj, complement, concept, np, type Forms } from '../languages/resolved.fixtures.js';
import { directionIdiom } from './directionIdiom.js';

const HOME = { base: 'home' };
const IDIOMS = { HOME: 'home' };

/** A noun phrase headed by the HOME concept, which the idiom table is keyed by. */
function home(extra: Forms = {}, rest: Partial<Omit<ResolvedNounPhrase, 'head'>> = {}): ResolvedNounPhrase {
  return { ...np(HOME, extra, rest), head: concept({ ...HOME, ...extra }, 'HOME') };
}

const idiom = (phrase: ResolvedNounPhrase, c = complement(phrase)) => directionIdiom(c, phrase, IDIOMS);

describe('directionIdiom', () => {
  // P09-E37: "goes home", "va a casa", "geht nach Hause".
  test('the plain goal on the definite or bare singular noun takes the idiom', () => {
    expect(idiom(home({ definiteness: 'definite' }))).toBe('home');
    expect(idiom(home({ definiteness: 'bare' }))).toBe('home');
    expect(idiom(home())).toBe('home');
  });

  test('a noun with no idiom in the table is an ordinary goal', () => {
    expect(idiom(np(HOME))).toBeUndefined();
  });

  test('any relation — containment too — makes it a place: "into the home"', () => {
    const phrase = home();
    expect(idiom(phrase, complement(phrase, [{ kind: 'path', value: 'in' }]))).toBeUndefined();
    expect(idiom(phrase, complement(phrase, [{ kind: 'path', value: 'behind' }]))).toBeUndefined();
  });

  test.each(['indefinite', 'this', 'no', 'all'])('a chosen determiner (%s) keeps the ordinary goal', (definiteness) => {
    expect(idiom(home({ definiteness }))).toBeUndefined();
  });

  test('a plural or a modifier keeps the ordinary goal', () => {
    expect(idiom(home({ number: 'plural' }))).toBeUndefined();
    expect(idiom(home({}, { adjectives: [adj({ base: 'old' })] }))).toBeUndefined();
    expect(idiom(home({}, { possessor: { kind: 'pronominal', person: '1', number: 'singular' } }))).toBeUndefined();
  });
});
