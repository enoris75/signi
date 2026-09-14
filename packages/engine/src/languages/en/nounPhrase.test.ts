import { describe, expect, test } from 'vitest';
import type { ResolvedRelativeClause } from '../../types.js';
import {
  AFRICA, BOOK, CAT, CHILD, CREATOR, EAT, el, EUROPE, type Forms, MOUSE, np, OBJECT, vp, WATER,
} from './en.fixtures.js';
import { nounPhrase } from './nounPhrase.js';

const FATHER: Forms = { base: 'father', plural: 'fathers', count: 'singular', animate: '1', human: '1' };

const eatsTheMouse: ResolvedRelativeClause = { headRole: 'subject', verbPhrase: vp(EAT), directObject: el(np(MOUSE)) };

describe('nounPhrase', () => {
  test('defaults to the definite article', () => {
    expect(nounPhrase(CAT)).toBe('the cat');
  });

  test('a plural takes the plural form, reading number and falling back to count', () => {
    expect(nounPhrase({ ...CAT, number: 'plural' })).toBe('the cats');
    expect(nounPhrase({ ...MOUSE, number: 'plural' })).toBe('the mice');
    expect(nounPhrase({ ...CAT, count: 'plural' })).toBe('the cats');
  });

  test('adjectives, then noun modifiers, precede the head', () => {
    expect(nounPhrase(CREATOR, 'new', 'phrase')).toBe('the new phrase creator');
  });

  test('a/an follows the sound of the first word after the article', () => {
    const indefinite = (forms: Forms) => ({ ...forms, definiteness: 'indefinite' });
    expect(nounPhrase(indefinite(OBJECT))).toBe('an object');
    expect(nounPhrase(indefinite(OBJECT), 'big')).toBe('a big object');
    expect(nounPhrase(indefinite(CAT), 'old')).toBe('an old cat');
    expect(nounPhrase(indefinite(CREATOR), undefined, 'object')).toBe('an object creator');
  });

  test('an before other is written as one word', () => {
    const indefinite = (forms: Forms) => ({ ...forms, definiteness: 'indefinite' });
    expect(nounPhrase(indefinite(CAT), 'other')).toBe('another cat');
    expect(nounPhrase(indefinite(CAT), 'other big')).toBe('another big cat');
    expect(nounPhrase({ ...CAT, definiteness: 'definite' }, 'other')).toBe('the other cat');
    // Only the word "other" fuses: "otherworldly" is a word of its own.
    expect(nounPhrase(indefinite(CAT), 'otherworldly')).toBe('an otherworldly cat');
  });

  test('an indefinite plural or mass noun goes bare', () => {
    expect(nounPhrase({ ...MOUSE, number: 'plural', definiteness: 'indefinite' })).toBe('mice');
    expect(nounPhrase({ ...WATER, definiteness: 'indefinite' })).toBe('water');
  });

  test('demonstratives agree in number and quantifiers pick the mass form', () => {
    expect(nounPhrase({ ...BOOK, number: 'plural', definiteness: 'this' })).toBe('these books');
    expect(nounPhrase({ ...WATER, definiteness: 'many' })).toBe('much water');
  });

  test('a proper noun takes no article, whatever determiner was chosen', () => {
    expect(nounPhrase(AFRICA)).toBe('Africa');
    expect(nounPhrase({ ...EUROPE, definiteness: 'this' })).toBe('Europe');
  });

  test('a superlative forces the definite article on an indefinite or bare phrase', () => {
    expect(nounPhrase({ ...CAT, definiteness: 'indefinite' }, 'biggest', undefined, undefined, true)).toBe('the biggest cat');
    expect(nounPhrase({ ...CAT, number: 'plural', definiteness: 'bare' }, 'biggest', undefined, undefined, true)).toBe('the biggest cats');
    expect(nounPhrase({ ...CAT, definiteness: 'indefinite' }, 'bigger')).toBe('a bigger cat');
  });

  describe('possessors', () => {
    test('a pronominal possessor replaces the article', () => {
      expect(nounPhrase({ ...BOOK, definiteness: 'indefinite' }, 'big', undefined, { kind: 'pronominal', person: '3', number: 'singular', gender: 'fem' }))
        .toBe('her big book');
      expect(nounPhrase(BOOK, undefined, undefined, { kind: 'pronominal', person: '3', number: 'singular', gender: 'masc' })).toBe('his book');
      expect(nounPhrase({ ...BOOK, number: 'plural' }, undefined, undefined, { kind: 'pronominal', person: '1', number: 'plural' })).toBe('our books');
    });

    test('a noun possessor is a Saxon genitive that replaces the article', () => {
      expect(nounPhrase(BOOK, undefined, undefined, np(CAT))).toBe("the cat's book");
      expect(nounPhrase(BOOK, 'old', undefined, np(CAT, { definiteness: 'indefinite' }))).toBe("a cat's old book");
    });

    test('a plural possessor ending in -s takes a bare apostrophe', () => {
      expect(nounPhrase(BOOK, undefined, undefined, np(CAT, { number: 'plural' }))).toBe("the cats' book");
      expect(nounPhrase(BOOK, undefined, undefined, np(CHILD, { number: 'plural' }))).toBe("the children's book");
    });

    test('possessors chain, each with its own possessor', () => {
      expect(nounPhrase(BOOK, undefined, undefined, np(FATHER, {}, { possessor: np(CAT) }))).toBe("the cat's father's book");
      expect(nounPhrase(BOOK, undefined, undefined, np(FATHER, {}, { possessor: { kind: 'pronominal', person: '1', number: 'singular' } })))
        .toBe("my father's book");
    });

    // The group-genitive constraint: "'s" can't land on the last word of a relative clause.
    test('a post-modified possessor takes the of-genitive and the head keeps its article', () => {
      const catThatEats = np(CAT, {}, { relative: eatsTheMouse });
      expect(nounPhrase(BOOK, undefined, undefined, catThatEats)).toBe('the book of the cat that eats the mouse');
      expect(nounPhrase({ ...BOOK, definiteness: 'indefinite' }, undefined, undefined, catThatEats)).toBe('a book of the cat that eats the mouse');
    });

    test('post-modification propagates up the possessor chain', () => {
      const fatherOfCatThatEats = np(FATHER, {}, { possessor: np(CAT, {}, { relative: eatsTheMouse }) });
      expect(nounPhrase(BOOK, undefined, undefined, fatherOfCatThatEats)).toBe('the book of the father of the cat that eats the mouse');
    });
  });
});
