import { describe, expect, test } from 'vitest';
import { adj, BIG, BOOK, BOY, CAT, CHILD, CREATOR, CRY, EAT, el, MOUSE, np, nounModifier, PHRASE, READ, vp, WOLF, YOUNG } from './en.fixtures.js';
import { possessorPhrase } from './possessorPhrase.js';

describe('possessorPhrase', () => {
  test('a noun phrase with its determiner and adjectives', () => {
    expect(possessorPhrase(np(CAT))).toBe('the cat');
    expect(possessorPhrase(np(BOY, {}, { adjectives: [adj(YOUNG)] }))).toBe('the young boy');
  });

  test('keeps its own determiner and number', () => {
    expect(possessorPhrase(np(CAT, { definiteness: 'indefinite' }))).toBe('a cat');
    expect(possessorPhrase(np(CHILD, { number: 'plural' }))).toBe('the children');
    expect(possessorPhrase(np(WOLF, { definiteness: 'this', number: 'plural' }))).toBe('these wolves');
  });

  test('an attributive noun sits before the head', () => {
    expect(possessorPhrase(np(CREATOR, {}, { nounModifiers: [nounModifier(PHRASE)] }))).toBe('the phrase creator');
  });

  test('a superlative forces the definite article', () => {
    expect(possessorPhrase(np(CAT, { definiteness: 'indefinite' }, { adjectives: [adj(BIG, { degree: 'most' })] }))).toBe('the biggest cat');
  });

  test('renders its own possessor, genitive or pronominal', () => {
    expect(possessorPhrase(np(CAT, {}, { possessor: np(BOY) }))).toBe("the boy's cat");
    expect(possessorPhrase(np(CAT, {}, { possessor: { kind: 'pronominal', person: '3', number: 'singular', gender: 'fem' } }))).toBe('her cat');
  });

  test('appends its relative clause', () => {
    expect(possessorPhrase(np(BOY, {}, { relative: { headRole: 'subject', verbPhrase: vp(CRY) } }))).toBe('the boy who cries');
    expect(possessorPhrase(np(CAT, {}, { relative: { headRole: 'subject', verbPhrase: vp(EAT), directObject: el(np(MOUSE)) } })))
      .toBe('the cat that eats the mouse');
    expect(possessorPhrase(np(BOOK, {}, { relative: { headRole: 'directObject', subject: el(np(BOY)), verbPhrase: vp(READ) } })))
      .toBe('the book that the boy reads');
  });

  test('a post-modified possessor of its own trails as an of-genitive', () => {
    const catThatEats = np(CAT, {}, { relative: { headRole: 'subject', verbPhrase: vp(EAT) } });
    expect(possessorPhrase(np(BOOK, {}, { possessor: catThatEats }))).toBe('the book of the cat that eats');
  });
});
