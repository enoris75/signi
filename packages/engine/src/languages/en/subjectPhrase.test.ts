import { describe, expect, test } from 'vitest';
import {
  adj, BIG, BOOK, CAT, CREATOR, EAT, HE, I, MOUSE, nounModifier, np, OLD, ONE, PHRASE, SEMANTIC, SHE, vp, YOU,
} from './en.fixtures.js';
import { subjectPhrase } from './subjectPhrase.js';

describe('subjectPhrase', () => {
  test('a pronoun renders its base form, with no article', () => {
    expect(subjectPhrase(np(I))).toBe('I');
    expect(subjectPhrase(np(HE))).toBe('he');
    expect(subjectPhrase(np(SHE))).toBe('she');
    expect(subjectPhrase(np(ONE))).toBe('one');
  });

  test('a plural pronoun renders its plural form', () => {
    expect(subjectPhrase(np(I, { number: 'plural' }))).toBe('we');
    expect(subjectPhrase(np(HE, { number: 'plural' }))).toBe('they');
    expect(subjectPhrase(np(YOU, { number: 'plural' }))).toBe('you');
  });

  test('a noun renders its full noun phrase', () => {
    expect(subjectPhrase(np(CAT, { definiteness: 'indefinite' }, { adjectives: [adj(OLD)] }))).toBe('an old cat');
    expect(subjectPhrase(np(MOUSE, { number: 'plural' }))).toBe('the mice');
  });

  test('a superlative adjective forces the definite article', () => {
    expect(subjectPhrase(np(CAT, { definiteness: 'indefinite' }, { adjectives: [adj(BIG, { degree: 'most' })] }))).toBe('the biggest cat');
  });

  test('noun modifiers and a possessor take their places', () => {
    expect(subjectPhrase(np(CREATOR, {}, { nounModifiers: [nounModifier(PHRASE, [adj(SEMANTIC)])] }))).toBe('the semantic phrase creator');
    expect(subjectPhrase(np(BOOK, {}, { possessor: np(CAT) }))).toBe("the cat's book");
  });

  test('leaves the head’s relative clause to the caller', () => {
    expect(subjectPhrase(np(CAT, {}, { relative: { headRole: 'subject', verbPhrase: vp(EAT) } }))).toBe('the cat');
  });
});
