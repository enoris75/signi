import { describe, expect, test } from 'vitest';
import { BORROWED, concepts, RM_RUMGR } from '../index.js';

// P04-E4: the Rumantsch Grischun column's nouns, adjectives, adverbs, pronouns and interjection.
// Every form is (verify) until the variety's review (P04-E19); this pins the shape the engine
// (P04-E7) reads, and that no word is borrowed from Italian.
describe('the Rumantsch Grischun lexicon (P04-E4)', () => {
  const LEXICAL = ['noun', 'adjective', 'adverb', 'pronoun', 'interjection'];
  const lexical = concepts.filter((c) => LEXICAL.includes(c.role));
  const own = (role: string) => lexical.filter((c) => c.role === role && RM_RUMGR[c.id]);

  // The concepts outside the verbs still borrowing Italian's forms (`columns.ts`): none. A concept
  // added here must say why RG has no word for it.
  test('gives every noun, adjective, adverb, pronoun and interjection its own word', () => {
    const borrowed = (BORROWED['rm-rumgr'] ?? []).filter((id) => lexical.some((c) => c.id === id));
    expect(borrowed).toEqual([]);
  });

  test('gives every own noun a base and a gender', () => {
    const bad = own('noun')
      .filter((c) => !RM_RUMGR[c.id]!['base'] || !['masc', 'fem'].includes(RM_RUMGR[c.id]!['gender'] ?? ''))
      .map((c) => c.id);
    expect(bad).toEqual([]);
  });

  test('gives a noun a plural wherever Italian has one', () => {
    const bad = own('noun').filter((c) => c.forms['it']?.['plural'] && !RM_RUMGR[c.id]!['plural']).map((c) => c.id);
    expect(bad).toEqual([]);
  });

  test('stores all four agreeing forms of every own adjective', () => {
    const bad = own('adjective').flatMap((c) =>
      ['base', 'fem', 'masc_plural', 'fem_plural'].filter((k) => !RM_RUMGR[c.id]![k]).map((k) => `${c.id}.${k}`),
    );
    expect(bad).toEqual([]);
  });

  test('stores no simple past, no future and no gerund (P04 D5, D7)', () => {
    const bad = lexical.flatMap((c) =>
      Object.keys(RM_RUMGR[c.id] ?? {})
        .filter((k) => /_past$|_future$/.test(k) || k === 'gerund')
        .map((k) => `${c.id}.${k}`),
    );
    expect(bad).toEqual([]);
  });

  test('mirrors every key of the Italian entry', () => {
    const bad = lexical.flatMap((c) =>
      Object.keys(c.forms['it'] ?? {}).filter((k) => !(k in (RM_RUMGR[c.id] ?? {}))).map((k) => `${c.id}.${k}`),
    );
    expect(bad).toEqual([]);
  });

  test('writes language names lowercase (P04 §0.5)', () => {
    const bad = lexical
      .filter((c) => c.isA === 'LANGUAGE' && /[A-Z]/.test(RM_RUMGR[c.id]?.['base'] ?? ''))
      .map((c) => c.id);
    expect(bad).toEqual([]);
  });

  test.each([
    ['CAT', { base: 'giat', plural: 'giats', gender: 'masc', fem: 'giatta' }],
    ['WATER', { base: 'aua', gender: 'fem' }],
    ['MAN', { base: 'um', plural: 'umens', gender: 'masc' }],
    ['MOUSE', { base: 'mieur', gender: 'fem' }],
    ['GOOD', { base: 'bun', fem: 'buna', masc_plural: 'buns', fem_plural: 'bunas', position: 'pre' }],
    ['BIG', { base: 'grond', fem: 'gronda', masc_plural: 'gronds', fem_plural: 'grondas' }],
    ['OLD', { base: 'vegl', fem: 'veglia' }],
    ['FIRST_PERSON', { base: 'jau', plural: 'nus' }],
    ['THIRD_PERSON', { base: 'el', singular_fem: 'ella', plural: 'els' }],
    ['GENERIC_PERSON', { base: 'ins' }],
    ['RUMANTSCH_GRISCHUN', { base: 'rumantsch grischun', gender: 'masc' }],
    ['GERMAN', { base: 'tudestg' }],
  ])('%s', (id, expected) => {
    expect(RM_RUMGR[id]).toMatchObject(expected);
    expect(concepts.find((c) => c.id === id)?.forms['rm-rumgr']).toMatchObject(expected);
  });
});
