import { describe, expect, test } from 'vitest';
import { COMER, el, GATO, LIVRO, MENINO, nounModifier, np, PALAVRA, SE, vp } from './pt.fixtures.js';
import { relativeGloss } from './relativeGloss.js';

const eatenByOne = { headRole: 'directObject' as const, subject: el(np(SE)), verbPhrase: vp(COMER) };

describe('relativeGloss', () => {
  test('is the relative alone, with no head before it', () => {
    expect(relativeGloss(np(LIVRO, {}, { relative: eatenByOne }))).toBe('que se come');
    expect(relativeGloss(np(GATO, {}, { relative: { headRole: 'subject', verbPhrase: vp(COMER, { negative: true }) } })))
      .toBe('que não come');
  });

  // The head is unsaid but still the antecedent: a plural one is a subject relative's subject.
  test('agrees with the unspoken head', () => {
    expect(relativeGloss(np(GATO, { number: 'plural' }, { relative: { headRole: 'subject', verbPhrase: vp(COMER) } })))
      .toBe('que comem');
  });

  test('drops what belongs to the head: its attributive nouns and its possessor', () => {
    const phrase = np(LIVRO, {}, { nounModifiers: [nounModifier(PALAVRA)], possessor: np(MENINO), relative: eatenByOne });
    expect(relativeGloss(phrase)).toBe('que se come');
  });
});
