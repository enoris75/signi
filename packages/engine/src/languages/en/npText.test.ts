import { describe, expect, test } from 'vitest';
import {
  adj, BEAUTIFUL, BIG, BOOK, BOY, CAT, CREATOR, CRY, DOG, EAT, el, GOOD, MOUSE, NEW, nounModifier, np, OLD, PHRASE, READ, vp, WATER,
} from './en.fixtures.js';
import { npText } from './npText.js';

describe('npText', () => {
  test('the determiner, then the adjectives in order, then the head', () => {
    expect(npText(np(CAT, {}, { adjectives: [adj(BIG), adj(OLD)] }))).toBe('the big old cat');
    expect(npText(np(MOUSE, { number: 'plural', definiteness: 'indefinite' }))).toBe('mice');
    expect(npText(np(WATER, { definiteness: 'few' }))).toBe('little water');
  });

  test('each adjective carries its own degree', () => {
    expect(npText(np(CAT, { definiteness: 'indefinite' }, { adjectives: [adj(BIG, { degree: 'more' })] }))).toBe('a bigger cat');
    expect(npText(np(CAT, { definiteness: 'indefinite' }, { adjectives: [adj(BEAUTIFUL, { degree: 'more' })] }))).toBe('a more beautiful cat');
  });

  test('a superlative adjective forces the definite article', () => {
    expect(npText(np(CAT, { definiteness: 'indefinite' }, { adjectives: [adj(GOOD, { degree: 'most' })] }))).toBe('the best cat');
  });

  test('noun modifiers sit between the adjectives and the head', () => {
    expect(npText(np(CREATOR, { definiteness: 'indefinite' }, { adjectives: [adj(NEW)], nounModifiers: [nounModifier(PHRASE)] })))
      .toBe('a new phrase creator');
  });

  test('a relative clause trails the phrase', () => {
    expect(npText(np(CAT, {}, { relative: { headRole: 'subject', verbPhrase: vp(EAT), directObject: el(np(MOUSE)) } })))
      .toBe('the cat that eats the mouse');
    expect(npText(np(BOY, {}, { relative: { headRole: 'subject', verbPhrase: vp(CRY, { tense: 'past' }) } }))).toBe('the boy who cried');
  });

  test('a possessor and a relative clause together', () => {
    const book = np(BOOK, {}, { possessor: np(CAT), relative: { headRole: 'directObject', subject: el(np(DOG)), verbPhrase: vp(READ) } });
    expect(npText(book)).toBe("the cat's book that the dog reads");
  });
});
