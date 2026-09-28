import { describe, expect, test } from 'vitest';
import { BORROWED, LT, PL, concepts } from '../index.js';
import { LT_ADJECTIVES } from './adjectives.js';
import { LT_ADVERBS } from './adverbs.js';
import { LT_INTERJECTIONS } from './interjections.js';
import { LT_PRONOUNS } from './pronouns.js';

// P18-E7: the Lithuanian column's adjectives, adverbs, pronouns and interjection. Every form is
// (verify) until the native review (P18-E12); this pins the shape the engine (P18-E8) reads
// (style-lt.md), and that no word of these roles is borrowed from Polish. Nouns and verbs are pinned by
// their own tests.
describe('the Lithuanian lexicon: adjectives, adverbs, pronouns, interjections (P18-E7)', () => {
  const FILES: Record<string, Record<string, Record<string, string>>> = {
    adjective: LT_ADJECTIVES, adverb: LT_ADVERBS, pronoun: LT_PRONOUNS, interjection: LT_INTERJECTIONS,
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

  test('borrows no adjective, adverb, pronoun or interjection from Polish', () => {
    const borrowed = (BORROWED['lt'] ?? []).filter((id) => lexical.some((c) => c.id === id));
    expect(borrowed).toEqual([]);
  });

  test('every adjective stores base, fem, neuter and both degrees (empty when analytic)', () => {
    const bad = Object.entries(LT_ADJECTIVES).flatMap(([id, f]) => [
      ...['base', 'fem', 'neuter'].filter((k) => !f[k]),
      ...['comparative', 'superlative'].filter((k) => typeof f[k] !== 'string'),
    ].map((k) => `${id}.${k}`));
    expect(bad).toEqual([]);
  });

  test('an adjective adj() cannot build stores its full table (style-lt.md is silent; the pronouns\' keys)', () => {
    const TABLE = ['SAME', 'ADULT', 'TIRED', 'SURE', 'LAST_PREVIOUS', 'NEXT_COMING', 'RIGHT_SIDE', 'OKAY', 'UNTITLED'];
    const bad = TABLE.flatMap((id) => {
      const f = LT_ADJECTIVES[id]!;
      const noms = ['plural', 'plural_fem'].filter((k) => !f[k]);
      const obl = ['', 'fem_', 'plural_', 'plural_fem_'].flatMap((p) => ['gen', 'dat', 'acc', 'ins', 'loc'].map((c) => `${p}${c}`)).filter((k) => !f[k]);
      return [...noms, ...obl].map((k) => `${id}.${k}`);
    });
    expect(bad).toEqual([]);
  });

  test('no adjective is negative (only adverbs carry polarity), and none keeps a Polish-only key', () => {
    const POLISH = ['virile', 'nonvirile', 'neut', 'acc_animate', 'polarity'];
    const bad = Object.entries(LT_ADJECTIVES)
      .flatMap(([id, f]) => Object.keys(f).filter((k) => POLISH.some((p) => k === p || k.startsWith(`${p}_`))).map((k) => `${id}.${k}`));
    expect(bad).toEqual([]);
  });

  test('only an invariable phrase follows its noun', () => {
    const post = Object.entries(LT_ADJECTIVES).filter(([, f]) => f['position'] === 'post').map(([id]) => id).sort();
    const invariable = Object.entries(LT_ADJECTIVES).filter(([, f]) => f['invariable'] === '1').map(([id]) => id).sort();
    expect(post).toEqual(invariable);
  });

  // The meaning flags of the Polish entry the Lithuanian one keeps (style-lt.md § Non-word keys).
  test('mirrors the meaning flags of the Polish adjectives, adverbs and pronouns', () => {
    const MEANING = ['subtype', 'polarity', 'negative', 'negative_slot', 'interrogative', 'fuses_with', 'fused', 'negator_lead',
      'fronted', 'equative', 'drop_degrees', 'person', 'number', 'generic', 'thing', 'with_other', 'negative_with_other',
      'ordinal', 'after_pronoun', 'invariable'];
    const bad = lexical.flatMap((c) =>
      Object.keys(PL[c.id] ?? {}).filter((k) => MEANING.includes(k) && !(k in LT[c.id]!)).map((k) => `${c.id}.${k}`));
    expect(bad).toEqual([]);
  });

  test('declines every pronoun in all five oblique cases, under each of its variants', () => {
    const CASES = ['gen', 'dat', 'acc', 'ins', 'loc'];
    const bad = Object.entries(LT_PRONOUNS).flatMap(([id, f]) => {
      if (id === 'GENERIC_PERSON') return [];
      const variants = [''];
      if (f['plural']) variants.push('plural_');
      if (f['singular_fem']) variants.push('fem_');
      if (f['plural_fem']) variants.push('plural_fem_');
      if (f['negative']) variants.push('negative_');
      if (f['with_other']) variants.push('with_other_');
      if (f['negative_with_other']) variants.push('negative_with_other_');
      return variants.flatMap((v) => CASES.filter((c) => !f[`${v}${c}`]).map((c) => `${id}.${v}${c}`));
    });
    expect(bad).toEqual([]);
  });

  test('uses only the style sheet\'s pronoun keys (no clitic, prep_ or neuter variant)', () => {
    const FLAGS = ['base', 'person', 'number', 'gender', 'generic', 'thing',
      'singular_fem', 'plural', 'plural_fem', 'negative', 'with_other', 'negative_with_other'];
    const CASE = /^(fem_|plural_fem_|plural_|negative_with_other_|negative_|with_other_)?(gen|dat|acc|ins|loc)$/;
    const bad = Object.entries(LT_PRONOUNS).flatMap(([id, f]) =>
      Object.keys(f).filter((k) => !FLAGS.includes(k) && !CASE.test(k)).map((k) => `${id}.${k}`));
    expect(bad).toEqual([]);
  });

  test.each([
    ['GOOD', { base: 'geras', fem: 'gera', neuter: 'gera', comparative: 'geresnis', superlative: 'geriausias' }],
    ['BIG', { base: 'didelis', fem: 'didelė', comparative: 'didesnis', superlative: 'didžiausias' }],
    ['BEAUTIFUL', { base: 'gražus', fem: 'graži', neuter: 'gražu', comparative: 'gražesnis', superlative: 'gražiausias' }],
    ['WHITE', { base: 'baltas', superlative: 'balčiausias' }],
    ['EMPTY', { base: 'tuščias', fem: 'tuščia', comparative: 'tuštesnis', superlative: 'tuščiausias' }],
    ['WILD', { base: 'laukinis', fem: 'laukinė', comparative: '', superlative: '' }],
    ['THIRD', { base: 'trečias', fem: 'trečia', ordinal: '1' }],
    ['OTHER', { base: 'kitas', after_pronoun: 'kita' }],
    ['SAME', { base: 'tas pats', fem: 'ta pati', plural: 'tie patys', plural_fem: 'tos pačios', gen: 'to paties', fem_acc: 'tą pačią', plural_loc: 'tuose pačiuose' }],
    ['TIRED', { base: 'pavargęs', fem: 'pavargusi', plural: 'pavargę', neuter: 'pavargę', gen: 'pavargusio', fem_loc: 'pavargusioje', plural_dat: 'pavargusiems' }],
    ['NEXT_COMING', { base: 'ateinantis', fem: 'ateinanti', plural: 'ateinantys', acc: 'ateinantį', fem_acc: 'ateinančią', plural_dat: 'ateinantiems', ordinal: '1' }],
    ['UNTITLED', { base: 'be pavadinimo', fem_ins: 'be pavadinimo', invariable: '1', position: 'post' }],
    ['NEVER', { base: 'niekada', polarity: 'negative', interrogative: 'kada nors', fuses_with: 'AGAIN', fused: 'daugiau niekada' }],
    ['NO_LONGER', { base: 'jau ne', polarity: 'negative', negator_lead: 'jau' }],
    ['ALREADY', { base: 'jau', negative: 'dar', negative_slot: 'pre-negator' }],
    ['FAST', { base: 'greitai', comparative: 'greičiau', superlative: 'greičiausiai' }],
    ['VERY', { base: 'labai', comparative: 'daug' }],
    ['FIRST_PERSON', { base: 'aš', gen: 'manęs', dat: 'man', acc: 'mane', ins: 'manimi', loc: 'manyje', plural: 'mes', plural_gen: 'mūsų', plural_ins: 'mumis' }],
    ['SECOND_PERSON', { base: 'tu', acc: 'tave', dat: 'tau', plural: 'jūs', plural_dat: 'jums', plural_loc: 'jumyse' }],
    ['THIRD_PERSON', {
      base: 'jis', gen: 'jo', acc: 'jį', ins: 'juo', singular_fem: 'ji', fem_acc: 'ją', fem_loc: 'joje',
      plural: 'jie', plural_acc: 'juos', plural_fem: 'jos', plural_fem_acc: 'jas', plural_fem_ins: 'jomis',
    }],
    ['GENERIC_PERSON', { base: 'žmogus', generic: '1' }],
    ['SOMETHING', { base: 'kažkas', acc: 'kažką', ins: 'kažkuo', negative: 'niekas', negative_gen: 'nieko', with_other: 'kažkas kita', negative_with_other: 'niekas kita' }],
    ['EVERYTHING', { base: 'viskas', gen: 'viso', acc: 'viską', thing: '1', with_other: 'visa kita', with_other_ins: 'visu kitu' }],
    ['SOMEONE', { base: 'kažkas', gender: 'masc', dat: 'kažkam', negative: 'niekas', negative_acc: 'nieką' }],
    ['HEY', { base: 'ei' }],
  ])('%s', (id, expected) => {
    expect(LT[id]).toMatchObject(expected);
    expect(concepts.find((c) => c.id === id)?.forms['lt']).toMatchObject(expected);
  });
});
