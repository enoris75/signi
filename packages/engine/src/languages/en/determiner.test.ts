import { describe, expect, test } from 'vitest';
import { AFRICA, ANIMAL, BOY, CAT, OBJECT, WATER, WOLF } from './en.fixtures.js';
import { determiner } from './determiner.js';

describe('determiner', () => {
  test('defaults to the definite article, in either number', () => {
    expect(determiner(CAT, 'cat')).toBe('the ');
    expect(determiner({ ...CAT, definiteness: 'definite', number: 'plural' }, 'cats')).toBe('the ');
  });

  describe('indefinite', () => {
    test('a before a consonant sound, an before a vowel', () => {
      expect(determiner({ ...CAT, definiteness: 'indefinite' }, 'cat')).toBe('a ');
      expect(determiner({ ...OBJECT, definiteness: 'indefinite' }, 'object')).toBe('an ');
    });

    test('a / an is chosen on the word that follows, not on the noun', () => {
      expect(determiner({ ...CAT, definiteness: 'indefinite' }, 'old')).toBe('an ');
      expect(determiner({ ...ANIMAL, definiteness: 'indefinite' }, 'big')).toBe('a ');
    });

    test('a plural or a mass noun takes no article', () => {
      expect(determiner({ ...WOLF, definiteness: 'indefinite', number: 'plural' }, 'wolves')).toBe('');
      expect(determiner({ ...WATER, definiteness: 'indefinite' }, 'water')).toBe('');
    });
  });

  test('bare takes no determiner', () => {
    expect(determiner({ ...CAT, definiteness: 'bare', number: 'plural' }, 'cats')).toBe('');
  });

  test('demonstratives agree in number, a mass noun staying singular', () => {
    expect(determiner({ ...BOY, definiteness: 'this' }, 'boy')).toBe('this ');
    expect(determiner({ ...BOY, definiteness: 'this', number: 'plural' }, 'boys')).toBe('these ');
    expect(determiner({ ...BOY, definiteness: 'that' }, 'boy')).toBe('that ');
    expect(determiner({ ...BOY, definiteness: 'that', number: 'plural' }, 'boys')).toBe('those ');
    expect(determiner({ ...WATER, definiteness: 'this', number: 'singular' }, 'water')).toBe('this ');
  });

  test('some, no, any and all', () => {
    expect(determiner({ ...CAT, definiteness: 'some', number: 'plural' }, 'cats')).toBe('some ');
    expect(determiner({ ...CAT, definiteness: 'no' }, 'cat')).toBe('no ');
    expect(determiner({ ...CAT, definiteness: 'any' }, 'cat')).toBe('any ');
    expect(determiner({ ...CAT, definiteness: 'all', number: 'plural' }, 'cats')).toBe('all ');
    expect(determiner({ ...WATER, definiteness: 'some' }, 'water')).toBe('some ');
  });

  test('many and few become much and little with a mass noun', () => {
    expect(determiner({ ...CAT, definiteness: 'many', number: 'plural' }, 'cats')).toBe('many ');
    expect(determiner({ ...CAT, definiteness: 'few', number: 'plural' }, 'cats')).toBe('few ');
    expect(determiner({ ...WATER, definiteness: 'many' }, 'water')).toBe('much ');
    expect(determiner({ ...WATER, definiteness: 'few' }, 'water')).toBe('little ');
  });

  test('a proper noun takes no article whatever was chosen', () => {
    expect(determiner({ ...AFRICA, definiteness: 'definite' }, 'Africa')).toBe('');
    expect(determiner({ ...AFRICA, definiteness: 'this' }, 'Africa')).toBe('');
  });

  // A183: a superlative is definite in English, on a name as on a common noun.
  test('a proper noun under a superlative gets its "the"', () => {
    expect(determiner({ ...AFRICA, definiteness: 'definite' }, 'biggest', true)).toBe('the ');
    expect(determiner({ ...AFRICA, definiteness: 'indefinite' }, 'biggest', true)).toBe('the ');
    expect(determiner({ ...AFRICA, definiteness: 'bare' }, 'least', true)).toBe('the ');
    // Without one it stays bare, so the positive and the comparative are untouched.
    expect(determiner({ ...AFRICA, definiteness: 'definite' }, 'bigger', false)).toBe('');
    expect(determiner(AFRICA, 'Africa')).toBe('');
  });

  describe('with a superlative', () => {
    test('an indefinite or bare determiner is forced to the', () => {
      expect(determiner({ ...CAT, definiteness: 'indefinite' }, 'biggest', true)).toBe('the ');
      expect(determiner({ ...CAT, definiteness: 'bare', number: 'plural' }, 'biggest', true)).toBe('the ');
    });

    test('the other determiners are kept', () => {
      expect(determiner({ ...CAT, definiteness: 'this' }, 'biggest', true)).toBe('this ');
      expect(determiner({ ...CAT, definiteness: 'definite' }, 'biggest', true)).toBe('the ');
    });
  });
});
