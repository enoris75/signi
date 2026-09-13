import { describe, expect, test } from 'vitest';
import { CASA, ELLA, GATO, NOSOTROS, YO } from './es.fixtures.js';
import { subjectPhrase } from './subjectPhrase.js';

describe('subjectPhrase', () => {
  test('a pronoun is its own surface, with no article', () => {
    expect(subjectPhrase(YO)).toBe('yo');
    expect(subjectPhrase(ELLA)).toBe('ella');
    expect(subjectPhrase(NOSOTROS)).toBe('nosotros');
  });

  test('a plural pronoun reads its plural form', () => {
    expect(subjectPhrase({ ...YO, number: 'plural' })).toBe('nosotros');
  });

  test('a pronoun ignores adjectives and a possessive', () => {
    expect(subjectPhrase(YO, { pre: '', post: 'cansado' }, 'mi')).toBe('yo');
  });

  test('a noun is a full noun phrase', () => {
    expect(subjectPhrase(GATO)).toBe('el gato');
    expect(subjectPhrase({ ...CASA, number: 'plural', definiteness: 'indefinite' }, { pre: '', post: 'viejas' })).toBe('unas casas viejas');
    expect(subjectPhrase(GATO, { pre: '', post: 'grande' }, 'su')).toBe('su gato grande');
  });
});
