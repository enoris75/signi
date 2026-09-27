import { describe, expect, test } from 'vitest';
import { BORROWED, CA, concepts } from '../index.js';

// P03: the Catalan column's adjectives, adverbs, pronouns and interjection. Every form is (verify)
// until the native review (P03-E11); this pins the shape the engine (Spanish's fork) reads, and that
// no word is borrowed from Spanish. The nouns and verbs are pinned by their own tests.
describe('the Catalan lexicon: adjectives, adverbs, pronouns, interjections (P03)', () => {
  const ROLES = ['adjective', 'adverb', 'pronoun', 'interjection'];
  const lexical = concepts.filter((c) => ROLES.includes(c.role));
  const own = (role: string) => lexical.filter((c) => c.role === role && CA[c.id]);

  // The concepts of these roles still borrowing Spanish's forms (`columns.ts`): none. A concept
  // added here must say why Catalan has no word for it.
  test('gives every adjective, adverb, pronoun and interjection its own word', () => {
    const borrowed = (BORROWED['ca'] ?? []).filter((id) => lexical.some((c) => c.id === id));
    expect(borrowed).toEqual([]);
  });

  test('stores all four agreeing forms of every adjective (P03 D6)', () => {
    const bad = own('adjective').flatMap((c) =>
      ['base', 'fem', 'plural', 'fem_plural'].filter((k) => !CA[c.id]![k]).map((k) => `${c.id}.${k}`),
    );
    expect(bad).toEqual([]);
  });

  // No key is Spanish-only among these roles: `stressed_a` is a noun's.
  test('mirrors every key of the Spanish entry', () => {
    const bad = lexical.flatMap((c) =>
      Object.keys(c.forms['es'] ?? {}).filter((k) => !(k in (CA[c.id] ?? {}))).map((k) => `${c.id}.${k}`),
    );
    expect(bad).toEqual([]);
  });

  test('stores no elided or contracted single word (style-ca: the engine elides)', () => {
    const bad = lexical.flatMap((c) =>
      Object.entries(CA[c.id] ?? {}).filter(([, v]) => /^(l'|d'|m'|t'|s'|n')|^(al|del|pel)$/.test(v)).map(([k]) => `${c.id}.${k}`),
    );
    expect(bad).toEqual([]);
  });

  test.each([
    ['WHITE', { base: 'blanc', fem: 'blanca', plural: 'blancs', fem_plural: 'blanques' }],
    ['BIG', { base: 'gran', fem: 'gran', plural: 'grans', fem_plural: 'grans' }],
    ['HAPPY', { base: 'feliç', fem: 'feliç', plural: 'feliços', fem_plural: 'feliços' }],
    ['NEW', { base: 'nou', fem: 'nova', plural: 'nous', fem_plural: 'noves' }],
    ['DARK', { base: 'fosc', fem: 'fosca', plural: 'foscos', fem_plural: 'fosques' }],
    ['OWN_ADJECTIVE', { base: 'propi', fem: 'pròpia', plural: 'propis', fem_plural: 'pròpies' }],
    ['GOOD', { base: 'bo', fem: 'bona', content_clause_mood: 'subjunctive' }],
    ['ABLE', { base: 'capaç', infinitive_link: 'de' }],
    ['SAME', { base: 'mateix', fem: 'mateixa', predicate_article: '1' }],
    ['OTHER', { base: 'altre', fem: 'altra', after_pronoun: 'més' }],
    ['NEVER', { base: 'mai', polarity: 'negative', fused: 'mai més' }],
    ['NO_LONGER', { base: 'ja no', polarity: 'negative', negator_lead: 'ja' }],
    ['ALREADY', { base: 'ja', negative: 'encara', negative_slot: 'pre-negator' }],
    ['ALSO', { base: 'també', negative: 'tampoc' }],
    ['TOGETHER', { base: 'junts', predicative: 'junt' }],
    ['FIRST_PERSON', { base: 'jo', plural: 'nosaltres', disjunctive: 'mi', object: 'em', object_plural: 'ens' }],
    ['SECOND_PERSON', { base: 'tu', plural: 'vosaltres', disjunctive: 'tu', object: 'et', object_plural: 'us' }],
    ['THIRD_PERSON', { base: 'ell', singular_fem: 'ella', plural_fem: 'elles', object: 'el', object_neut: 'ho', dative: 'li', dative_plural: 'els' }],
    ['GENERIC_PERSON', { base: 'es', generic: '1', generic_reflexive: 'un' }],
    ['SOMETHING', { base: 'alguna cosa', negative: 'res', with_other: 'una altra cosa', negative_with_other: 'res més' }],
    ['SOMEONE', { base: 'algú', negative: 'ningú' }],
    ['HEY', { base: 'ei' }],
  ])('%s', (id, expected) => {
    expect(CA[id]).toMatchObject(expected);
    expect(concepts.find((c) => c.id === id)?.forms['ca']).toMatchObject(expected);
  });
});
