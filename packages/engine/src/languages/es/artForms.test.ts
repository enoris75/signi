import { describe, expect, test } from 'vitest';
import { AFRICA, AGUA, ANTARTIDA, EUROPA, GATO } from './es.fixtures.js';
import { artFor } from './artFor.js';
import { artForms } from './artForms.js';
import { deDet } from './deDet.js';
import { defArticle } from './defArticle.js';
import { indefArticle } from './indefArticle.js';

describe('artForms', () => {
  test('without a prenominal adjective the forms pass through untouched', () => {
    expect(artForms(AGUA)).toBe(AGUA);
    expect(artForms(AGUA, { pre: '', post: 'fría' })).toBe(AGUA);
    expect(defArticle(artForms(AGUA, { pre: '', post: 'fría' }))).toBe('el');
    expect(artForms(GATO, { pre: '', post: 'grande' })).toBe(GATO);
  });

  test('a prenominal adjective lifts the stressed-a exception', () => {
    // "la primera agua", not "el primera agua": the article no longer touches the stressed a-.
    const forms = artForms(AGUA, { pre: 'primera', post: '' });
    expect(defArticle(forms)).toBe('la');
    expect(indefArticle(forms)).toBe('una');
  });

  // A172: "la Europa afilada", "la primera Europa", as the lexicon's "la Antártida".
  test('an adjective articles a place name that goes bare on its own', () => {
    expect(artForms(EUROPA)).toBe(EUROPA);
    expect(artForms(EUROPA, { pre: '', post: '' })).toBe(EUROPA);
    expect(artFor(artForms(EUROPA, { pre: '', post: 'afilada' }))).toBe('la');
    expect(artFor(artForms(EUROPA, { pre: 'primera', post: '' }))).toBe('la');
    expect(artFor(artForms({ ...EUROPA, definiteness: 'indefinite' }, { pre: '', post: 'afilada' }))).toBe('la');
    expect(artForms(ANTARTIDA, { pre: '', post: 'grande' })).toBe(ANTARTIDA);
  });

  test('a stressed-a name takes "el" after a postnominal adjective and "la" after a prenominal one', () => {
    expect(artFor(artForms(AFRICA, { pre: '', post: 'grande' }))).toBe('el');
    expect(deDet(artForms(AFRICA, { pre: '', post: 'grande' }))).toBe('del');
    expect(artFor(artForms(AFRICA, { pre: 'primera', post: '' }))).toBe('la');
    expect(artFor(AFRICA)).toBe('');
  });

  test('does not edit the forms it was given', () => {
    artForms(AGUA, { pre: 'primera', post: '' });
    expect(AGUA['stressed_a']).toBe('1');
    artForms(EUROPA, { pre: '', post: 'afilada' });
    expect(EUROPA['takes_article']).toBeUndefined();
  });
});
