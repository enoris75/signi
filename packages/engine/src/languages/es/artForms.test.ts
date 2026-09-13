import { describe, expect, test } from 'vitest';
import { AGUA } from './es.fixtures.js';
import { artForms } from './artForms.js';
import { defArticle } from './defArticle.js';
import { indefArticle } from './indefArticle.js';

describe('artForms', () => {
  test('without a prenominal adjective the forms pass through untouched', () => {
    expect(artForms(AGUA)).toBe(AGUA);
    expect(artForms(AGUA, { pre: '', post: 'fría' })).toBe(AGUA);
    expect(defArticle(artForms(AGUA, { pre: '', post: 'fría' }))).toBe('el');
  });

  test('a prenominal adjective lifts the stressed-a exception', () => {
    // "la primera agua", not "el primera agua": the article no longer touches the stressed a-.
    const forms = artForms(AGUA, { pre: 'primera', post: '' });
    expect(defArticle(forms)).toBe('la');
    expect(indefArticle(forms)).toBe('una');
  });

  test('does not edit the forms it was given', () => {
    artForms(AGUA, { pre: 'primera', post: '' });
    expect(AGUA['stressed_a']).toBe('1');
  });
});
