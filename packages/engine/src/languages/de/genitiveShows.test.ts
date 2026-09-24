import { describe, expect, test } from 'vitest';
import { adj, EUROPA, type Forms, GROSS, KATER, KATZE, KLEIN, np, SCHWEIZ, WASSER } from './de.fixtures.js';
import { genitiveShows } from './genitiveShows.js';

const PARIS: Forms = { base: 'Paris', gender: 'neut', count: 'singular', proper: '1' };

describe('genitiveShows', () => {
  test('an inflected determiner or possessive shows it', () => {
    expect(genitiveShows(np(KATER))).toBe(true);
    expect(genitiveShows(np(KATZE, { definiteness: 'indefinite' }))).toBe(true);
    expect(genitiveShows(np(KATER, { definiteness: 'some', number: 'plural' }))).toBe(true);
    expect(genitiveShows(np(KATER, { definiteness: 'bare' }, { possessor: { kind: 'pronominal', person: '1', number: 'singular' } }))).toBe(true);
    expect(genitiveShows(np(KATER, { definiteness: 'relative' }))).toBe(true);
  });

  // A326: a detached "von mir" marks no case, so the head's own determiner decides.
  test('beside a detached possessive, the head\'s own determiner decides', () => {
    const mine = { possessor: { kind: 'pronominal', person: '1', number: 'singular' } as const };
    expect(genitiveShows(np(KATZE, { definiteness: 'indefinite', number: 'plural' }, mine))).toBe(false);
    expect(genitiveShows(np(WASSER, { definiteness: 'indefinite' }, mine))).toBe(false);
    expect(genitiveShows(np(KATZE, { definiteness: 'indefinite' }, mine))).toBe(true);
    expect(genitiveShows(np(KATER, { definiteness: 'some', number: 'plural' }, mine))).toBe(true);
  });

  test('with no determiner, only an adjective shows it', () => {
    expect(genitiveShows(np(KATZE, { definiteness: 'bare', number: 'plural' }))).toBe(false);
    expect(genitiveShows(np(KATZE, { definiteness: 'indefinite', number: 'plural' }))).toBe(false);
    expect(genitiveShows(np(KATZE, { definiteness: 'bare', number: 'plural' }, { adjectives: [adj(KLEIN)] }))).toBe(true);
    expect(genitiveShows(np(WASSER, { definiteness: 'bare' }))).toBe(false);
  });

  test('an invariant mass quantifier does not show it, even before an adjective', () => {
    expect(genitiveShows(np(WASSER, { definiteness: 'some' }))).toBe(false);
    expect(genitiveShows(np(WASSER, { definiteness: 'many' }, { adjectives: [adj(GROSS)] }))).toBe(false);
    expect(genitiveShows(np(WASSER, { definiteness: 'no' }))).toBe(true);
  });

  test('a name shows it on its -s, or on the article it has or an adjective gives it', () => {
    expect(genitiveShows(np(EUROPA))).toBe(true);
    expect(genitiveShows(np(PARIS))).toBe(false);
    expect(genitiveShows(np(PARIS, {}, { adjectives: [adj(GROSS)] }))).toBe(true);
    expect(genitiveShows(np(SCHWEIZ))).toBe(true);
  });
});
