import { describe, expect, test } from 'vitest';
import { CAO, ELA, EU, GATO, NOS, VOCE } from './pt.fixtures.js';
import { subjectPhrase } from './subjectPhrase.js';

describe('subjectPhrase', () => {
  test('a pronoun is its own surface, with no article', () => {
    expect(subjectPhrase(EU)).toBe('eu');
    expect(subjectPhrase(ELA)).toBe('ela');
    expect(subjectPhrase(NOS)).toBe('nós');
  });

  test('a plural pronoun reads its plural form', () => {
    expect(subjectPhrase({ ...VOCE, number: 'plural' })).toBe('vocês');
  });

  test('a noun takes its determiner, adjectives and any possessive', () => {
    expect(subjectPhrase(GATO)).toBe('o gato');
    expect(subjectPhrase({ ...GATO, definiteness: 'indefinite' }, { pre: '', post: 'grande' })).toBe('um gato grande');
    expect(subjectPhrase(CAO, undefined, 'o seu')).toBe('o seu cão');
  });
});
