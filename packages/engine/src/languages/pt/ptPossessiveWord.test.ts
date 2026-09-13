import type { PronominalPossessor } from '@signi/shared';
import { describe, expect, test } from 'vitest';
import { CAO, CASA, GATO, LIVRO, np } from './pt.fixtures.js';
import { ptPossessiveWord } from './ptPossessiveWord.js';

const his: PronominalPossessor = { kind: 'pronominal', person: '3', number: 'singular', gender: 'masc' };
const her: PronominalPossessor = { kind: 'pronominal', person: '3', number: 'singular', gender: 'fem' };
const my: PronominalPossessor = { kind: 'pronominal', person: '1', number: 'singular' };
const our: PronominalPossessor = { kind: 'pronominal', person: '1', number: 'plural' };

describe('ptPossessiveWord', () => {
  test('is empty without a possessor or with a noun possessor', () => {
    expect(ptPossessiveWord(np(CAO))).toBe('');
    expect(ptPossessiveWord(np(LIVRO, {}, { possessor: np(GATO) }))).toBe('');
  });

  test('without the article it is the possessive alone, for a head that fuses the article itself', () => {
    expect(ptPossessiveWord(np(CASA, {}, { possessor: his }), false)).toBe('sua');
  });

  test('the article + possessive agree with the possessed head', () => {
    expect(ptPossessiveWord(np(CAO, {}, { possessor: his }))).toBe('o seu');
    expect(ptPossessiveWord(np(CASA, {}, { possessor: his }))).toBe('a sua');
    expect(ptPossessiveWord(np(LIVRO, { number: 'plural' }, { possessor: his }))).toBe('os seus');
    expect(ptPossessiveWord(np(CASA, { number: 'plural' }, { possessor: our }))).toBe('as nossas');
  });

  // Only the possessed head is agreed with: "seu" is his and her alike.
  test('the possessor picks the stem by person and number, not by gender', () => {
    expect(ptPossessiveWord(np(CAO, {}, { possessor: her }))).toBe('o seu');
    expect(ptPossessiveWord(np(CASA, {}, { possessor: my }))).toBe('a minha');
    expect(ptPossessiveWord(np(LIVRO, {}, { possessor: our }))).toBe('o nosso');
  });

  test('the indefinite article the head picked gives way to the definite', () => {
    expect(ptPossessiveWord(np(CAO, { definiteness: 'indefinite' }, { possessor: my }))).toBe('o meu');
  });
});
