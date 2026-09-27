import { describe, expect, test } from 'vitest';
import { BORROWED, concepts } from '../index.js';
import { CA_NOUNS } from './nouns.js';

// P03: the Catalan column's nouns. Every form is (verify) until the native review (P03-E11); this
// pins the shape the engine reads (style-ca.md), and that no noun is borrowed from Spanish.
describe('the Catalan nouns (P03)', () => {
  const nouns = concepts.filter((c) => c.role === 'noun');
  const own = nouns.filter((c) => CA_NOUNS[c.id]);
  // Spanish's keys that are words, translated rather than mirrored, and `stressed_a` (*el agua*),
  // which has no Catalan counterpart (*l'aigua*).
  const NOT_MIRRORED = ['base', 'plural', 'fem', 'fem_plural', 'stressed_a'];

  test('gives every noun its own word', () => {
    const borrowed = (BORROWED['ca'] ?? []).filter((id) => nouns.some((c) => c.id === id));
    expect(borrowed).toEqual([]);
    expect(own.length).toBe(nouns.length);
  });

  test('gives only nouns', () => {
    const stray = Object.keys(CA_NOUNS).filter((id) => !nouns.some((c) => c.id === id));
    expect(stray).toEqual([]);
  });

  test('gives every own noun a base and a gender', () => {
    const bad = own
      .filter((c) => !CA_NOUNS[c.id]!['base'] || !['masc', 'fem'].includes(CA_NOUNS[c.id]!['gender'] ?? ''))
      .map((c) => c.id);
    expect(bad).toEqual([]);
  });

  test('gives a noun a plural wherever Spanish has one', () => {
    const bad = own.filter((c) => c.forms['es']?.['plural'] && !CA_NOUNS[c.id]!['plural']).map((c) => c.id);
    expect(bad).toEqual([]);
  });

  test('gives a feminine wherever Spanish has one', () => {
    const bad = own
      .filter((c) => c.forms['es']?.['fem'] && !(CA_NOUNS[c.id]!['fem'] && CA_NOUNS[c.id]!['fem_plural']))
      .map((c) => c.id);
    expect(bad).toEqual([]);
  });

  test('marks no_elision only on feminine nouns in i-, u-, hi-, hu-', () => {
    const bad = own
      .filter((c) => CA_NOUNS[c.id]!['no_elision'])
      .filter((c) => CA_NOUNS[c.id]!['gender'] !== 'fem' || !/^h?[iu]/i.test(CA_NOUNS[c.id]!['base']!))
      .map((c) => c.id);
    expect(bad).toEqual([]);
  });

  test('keeps a whole la before an unstressed i- or u-', () => {
    for (const id of ['UNIVERSITY', 'STORY', 'HISTORY_PAST', 'IDEA', 'PICTURE', 'INFORMATION', 'UNIT']) {
      expect(CA_NOUNS[id]?.['no_elision'], id).toBe('1');
    }
  });

  test("mirrors every non-word key of the Spanish entry, except stressed_a", () => {
    const bad = own.flatMap((c) =>
      Object.keys(c.forms['es'] ?? {})
        .filter((k) => !NOT_MIRRORED.includes(k) && !(k in CA_NOUNS[c.id]!))
        .map((k) => `${c.id}.${k}`),
    );
    expect(bad).toEqual([]);
    expect(own.filter((c) => 'stressed_a' in CA_NOUNS[c.id]!).map((c) => c.id)).toEqual([]);
  });

  test('writes language names lowercase', () => {
    const bad = nouns
      .filter((c) => c.isA === 'LANGUAGE' && /[A-Z]/.test(CA_NOUNS[c.id]?.['base'] ?? ''))
      .map((c) => c.id);
    expect(bad).toEqual([]);
  });

  test('stores no elided article or contraction at the start of a word', () => {
    const bad = own.filter((c) => /^(l'|d'|al |del |pel )/.test(CA_NOUNS[c.id]!['base']!)).map((c) => c.id);
    expect(bad).toEqual([]);
  });

  test.each([
    ['CAT', { base: 'gat', plural: 'gats', gender: 'masc', fem: 'gata', fem_plural: 'gates' }],
    ['MOUSE', { base: 'ratolí', plural: 'ratolins', gender: 'masc' }],
    ['MAN', { base: 'home', plural: 'homes', gender: 'masc' }],
    ['WATER', { base: 'aigua', gender: 'fem' }],
    ['HOUSE', { base: 'casa', plural: 'cases', gender: 'fem' }],
    ['UNIVERSITY', { base: 'universitat', plural: 'universitats', gender: 'fem', no_elision: '1' }],
    ['FISH', { base: 'peix', plural: 'peixos' }],
    ['NEWS', { base: 'notícies', gender: 'fem', count: 'plural' }],
    ['CATALAN', { base: 'català', gender: 'masc', takes_article: '1' }],
    ['SPANISH', { base: 'espanyol', takes_article: '1' }],
    ['MOM', { base: 'mama', as_name: '1' }],
    ['MR', { base: 'senyor', takes_article: '1' }],
  ])('%s', (id, expected) => {
    expect(CA_NOUNS[id]).toMatchObject(expected);
    expect(concepts.find((c) => c.id === id)?.forms['ca']).toMatchObject(expected);
  });
});
