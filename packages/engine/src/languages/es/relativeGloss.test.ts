import { describe, expect, test } from 'vitest';
import { COMER, CREADOR, el, FRASE, GATO, LIBRO, NINO, nounModifier, np, SE, vp } from './es.fixtures.js';
import { relativeGloss } from './relativeGloss.js';

const eatenByOne = { headRole: 'directObject' as const, subject: el(np(SE)), verbPhrase: vp(COMER) };

describe('relativeGloss', () => {
  test('is the relative alone, with no head before it', () => {
    expect(relativeGloss(np(LIBRO, {}, { relative: eatenByOne }))).toBe('que se come');
    expect(relativeGloss(np(GATO, {}, { relative: { headRole: 'subject', verbPhrase: vp(COMER, { negative: true }) } })))
      .toBe('que no come');
  });

  // The head is unsaid but still the antecedent: a plural one is the passive se's patient.
  test('agrees with the unspoken head', () => {
    expect(relativeGloss(np(LIBRO, { number: 'plural' }, { relative: eatenByOne }))).toBe('que se comen');
  });

  test("drops what belongs to the head: its attributive nouns and its possessor", () => {
    const phrase = np(CREADOR, {}, { nounModifiers: [nounModifier(FRASE)], possessor: np(NINO), relative: eatenByOne });
    expect(relativeGloss(phrase)).toBe('que se come');
  });
});
