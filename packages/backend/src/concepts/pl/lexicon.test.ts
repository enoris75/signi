import { describe, expect, test } from 'vitest';
import { BORROWED, PL, concepts } from '../index.js';
import { PL_ADJECTIVES } from './adjectives.js';
import { PL_ADVERBS } from './adverbs.js';
import { PL_INTERJECTIONS } from './interjections.js';
import { PL_PRONOUNS } from './pronouns.js';

// P05-E6: the Polish column's adjectives, adverbs, pronouns and interjection. Every form is (verify)
// until the native review (P05-E11); this pins the shape the engine (P05-E7) reads (style-pl.md), and
// that no word of these roles is borrowed from German. Nouns and verbs are pinned by their own tests.
describe('the Polish lexicon: adjectives, adverbs, pronouns, interjections (P05-E6)', () => {
  const FILES: Record<string, Record<string, Record<string, string>>> = {
    adjective: PL_ADJECTIVES, adverb: PL_ADVERBS, pronoun: PL_PRONOUNS, interjection: PL_INTERJECTIONS,
  };
  const ROLES = Object.keys(FILES);
  const lexical = concepts.filter((c) => ROLES.includes(c.role));
  const ids = (role: string) => lexical.filter((c) => c.role === role).map((c) => c.id).sort();

  test.each(ROLES)('gives every %s its own entry, and only those', (role) => {
    expect(Object.keys(FILES[role]!).sort()).toEqual(ids(role));
  });

  test('counts: 153 adjectives, 40 adverbs, 7 pronouns, 1 interjection', () => {
    expect(ROLES.map((r) => Object.keys(FILES[r]!).length)).toEqual([153, 40, 7, 1]);
  });

  test('borrows no adjective, adverb, pronoun or interjection from German', () => {
    const borrowed = (BORROWED['pl'] ?? []).filter((id) => lexical.some((c) => c.id === id));
    expect(borrowed).toEqual([]);
  });

  test('every adjective is an -y/-i adjective with its virile, or stores its full table', () => {
    const bad = Object.entries(PL_ADJECTIVES).filter(([, f]) => {
      if (!f['base'] || !f['virile']) return true;
      if (/[yi]$/.test(f['base'])) return false;
      const table = ['fem', 'neut', 'nonvirile', 'acc_animate'].every((k) => f[k])
        && ['', 'fem_', 'neut_', 'virile_', 'nonvirile_'].every((p) => ['gen', 'dat', 'acc', 'ins', 'loc'].every((c) => f[`${p}${c}`]));
      return !table;
    }).map(([id]) => id);
    expect(bad).toEqual([]);
  });

  test('no adjective is negative (only adverbs carry polarity)', () => {
    const bad = Object.entries(PL_ADJECTIVES).filter(([, f]) => 'polarity' in f).map(([id]) => id);
    expect(bad).toEqual([]);
  });

  test('keeps no Spanish-only or German-only key', () => {
    const FOREIGN = ['content_clause_mood', 'predicate_article', 'umlaut', 'attributive', 'disjunctive', 'object', 'dative', 'predicative'];
    const bad = Object.entries({ ...PL_ADJECTIVES, ...PL_ADVERBS, ...PL_PRONOUNS })
      .flatMap(([id, f]) => FOREIGN.filter((k) => Object.keys(f).some((key) => key === k || key.startsWith(`${k}_`))).map((k) => `${id}.${k}`));
    expect(bad).toEqual([]);
  });

  // The meaning flags of the Spanish entry the Polish one keeps (style-pl.md § Non-word keys).
  test('mirrors the meaning flags of the Spanish adverbs and pronouns', () => {
    const MEANING = ['subtype', 'polarity', 'negative', 'negative_slot', 'interrogative', 'fuses_with', 'fused', 'negator_lead',
      'fronted', 'comparative', 'equative', 'superlative', 'drop_degrees', 'person', 'number', 'generic', 'thing', 'with_other',
      'negative_with_other'];
    const bad = lexical.filter((c) => c.role === 'adverb' || c.role === 'pronoun').flatMap((c) =>
      Object.keys(c.forms['es'] ?? {}).filter((k) => MEANING.includes(k) && !(k in PL[c.id]!)).map((k) => `${c.id}.${k}`));
    expect(bad).toEqual([]);
  });

  test('declines every pronoun in all five oblique cases, under each of its variants', () => {
    const CASES = ['gen', 'dat', 'acc', 'ins', 'loc'];
    const bad = Object.entries(PL_PRONOUNS).flatMap(([id, f]) => {
      const variants = [''];
      if (f['plural']) variants.push('plural_');
      if (f['singular_fem']) variants.push('fem_', 'fem_prep_', 'prep_');
      if (f['singular_neut']) variants.push('neut_', 'neut_prep_');
      if (f['plural_fem']) variants.push('plural_fem_', 'plural_prep_', 'plural_fem_prep_');
      if (f['negative']) variants.push('negative_');
      if (f['with_other']) variants.push('with_other_');
      if (f['negative_with_other']) variants.push('negative_with_other_');
      if (id === 'GENERIC_PERSON') return [];
      return variants.flatMap((v) => CASES.filter((c) => !f[`${v}${c}`]).map((c) => `${id}.${v}${c}`));
    });
    expect(bad).toEqual([]);
  });

  test('uses only the style sheet\'s pronoun keys', () => {
    const FLAGS = ['base', 'person', 'number', 'gender', 'generic', 'generic_reflexive', 'thing',
      'singular_fem', 'singular_neut', 'plural', 'plural_fem', 'negative', 'with_other', 'negative_with_other'];
    const CASE = /^(fem_|neut_|plural_fem_|plural_|negative_with_other_|negative_|with_other_)?(prep_)?(gen|dat|acc|ins|loc)(_short)?$/;
    const bad = Object.entries(PL_PRONOUNS).flatMap(([id, f]) =>
      Object.keys(f).filter((k) => !FLAGS.includes(k) && !CASE.test(k)).map((k) => `${id}.${k}`));
    expect(bad).toEqual([]);
  });

  test.each([
    ['GOOD', { base: 'dobry', virile: 'dobrzy', comparative: 'lepszy' }],
    ['HIGH', { base: 'wysoki', virile: 'wysocy', comparative: 'wyższy' }],
    ['BAD', { base: 'zły', virile: 'źli', comparative: 'gorszy' }],
    ['BIG', { base: 'duży', virile: 'duzi', comparative: 'większy' }],
    ['EMPTY', { base: 'pusty', virile: 'puści' }],
    ['SECOND', { base: 'drugi', virile: 'drudzy', ordinal: '1' }],
    ['THIRD', { base: 'trzeci', virile: 'trzeci', ordinal: '1' }],
    ['OTHER', { base: 'inny', virile: 'inni', after_pronoun: 'inny' }],
    ['DOMESTIC', { base: 'domowy', position: 'post' }],
    ['SAME', { base: 'ten sam', fem: 'ta sama', neut: 'to samo', virile: 'ci sami', nonvirile: 'te same', fem_acc: 'tę samą', acc_animate: 'tego samego' }],
    ['UNTITLED', { base: 'bez tytułu', fem_ins: 'bez tytułu', invariable: '1', position: 'post' }],
    ['NEVER', { base: 'nigdy', polarity: 'negative', interrogative: 'kiedykolwiek', fuses_with: 'AGAIN', fused: 'nigdy więcej' }],
    ['NO_LONGER', { base: 'już nie', polarity: 'negative', negator_lead: 'już' }],
    ['ALREADY', { base: 'już', negative: 'jeszcze', negative_slot: 'pre-negator' }],
    ['FAST', { base: 'szybko', comparative: 'szybciej', superlative: 'najszybciej' }],
    ['VERY', { base: 'bardzo', comparative: 'o wiele', equative: 'tak samo' }],
    ['FIRST_PERSON', { base: 'ja', gen: 'mnie', ins: 'mną', dat_short: 'mi', plural: 'my', plural_ins: 'nami' }],
    ['SECOND_PERSON', { base: 'ty', acc: 'ciebie', acc_short: 'cię', dat: 'tobie', plural: 'wy', plural_dat: 'wam' }],
    ['THIRD_PERSON', {
      base: 'on', acc_short: 'go', prep_acc: 'niego', singular_fem: 'ona', fem_acc: 'ją', fem_prep_ins: 'nią',
      singular_neut: 'ono', neut_acc: 'je', plural: 'oni', plural_acc: 'ich', plural_fem: 'one', plural_fem_acc: 'je', plural_prep_loc: 'nich',
    }],
    ['GENERIC_PERSON', { base: 'się', generic: '1' }],
    ['SOMETHING', { base: 'coś', gen: 'czegoś', negative: 'nic', negative_gen: 'niczego', with_other: 'coś innego', negative_with_other: 'nic innego' }],
    ['EVERYTHING', { base: 'wszystko', thing: '1', with_other: 'wszystko inne', with_other_ins: 'wszystkim innym' }],
    ['SOMEONE', { base: 'ktoś', acc: 'kogoś', negative: 'nikt', negative_acc: 'nikogo' }],
    ['HEY', { base: 'hej' }],
  ])('%s', (id, expected) => {
    expect(PL[id]).toMatchObject(expected);
    expect(concepts.find((c) => c.id === id)?.forms['pl']).toMatchObject(expected);
  });
});
