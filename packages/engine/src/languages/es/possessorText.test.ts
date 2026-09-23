import { describe, expect, test } from 'vitest';
import { questionPossessor } from '../../functions/questionPossessor.js';
import type { ResolvedNounPhrase } from '../../types.js';
import { adj, AGUA, ANTARTIDA, CASA, COMER, concept, EUROPA, GATO, GRANDE, HOMBRE, LIBRO, MUJER, NINO, np, PRIMERO, vp } from './es.fixtures.js';
import { possessorText } from './possessorText.js';

const bookOf = (possessor: ResolvedNounPhrase['possessor']) => possessorText(np(LIBRO, {}, { possessor }));

describe('possessorText', () => {
  test('a possessor\'s own possessive replaces its article after de', () => {
    expect(bookOf(np(NINO, {}, { possessor: { kind: 'pronominal', person: '1', number: 'singular' } }))).toBe(' de mi niño');
  });

  // A234: a demonstrative or a quantifier keeps its slot beside the possessive, which follows the noun
  // stressed, as in the object (A187).
  test('a possessor\'s own demonstrative or quantifier stays, and the stressed possessive follows the noun', () => {
    const my = { kind: 'pronominal', person: '1', number: 'singular' } as const;
    const his = { kind: 'pronominal', person: '3', number: 'singular' } as const;
    expect(bookOf(np(HOMBRE, { definiteness: 'this' }, { possessor: my }))).toBe(' de este hombre mío');
    expect(bookOf(np(HOMBRE, { definiteness: 'no' }, { possessor: his }))).toBe(' de ningún hombre suyo');
    expect(bookOf(np(MUJER, { definiteness: 'some', number: 'plural' }, { possessor: { kind: 'pronominal', person: '1', number: 'plural' } })))
      .toBe(' de algunas mujeres nuestras');
    // The indefinite keeps its slot too since A277 (it was " de mi hombre").
    expect(bookOf(np(HOMBRE, { definiteness: 'indefinite' }, { possessor: my }))).toBe(' de un hombre mío');
    expect(bookOf(np(HOMBRE, { definiteness: 'bare' }, { possessor: my }))).toBe(' de mi hombre');
  });

  test('is empty without a noun possessor', () => {
    expect(possessorText(np(LIBRO))).toBe('');
    expect(bookOf({ kind: 'pronominal', person: '3', number: 'singular' })).toBe('');
  });

  test('a leading space, then de fused with the possessor’s article', () => {
    expect(bookOf(np(NINO))).toBe(' del niño');
    expect(bookOf(np(MUJER))).toBe(' de la mujer');
    expect(bookOf(np(GATO, { number: 'plural' }))).toBe(' de los gatos');
    expect(bookOf(np(CASA, { count: 'plural' }))).toBe(' de las casas');
    expect(bookOf(np(AGUA))).toBe(' del agua');
  });

  test('the possessor keeps its own determiner, fusing del only for the masculine singular definite', () => {
    expect(bookOf(np(HOMBRE, { definiteness: 'indefinite' }))).toBe(' de un hombre');
    expect(bookOf(np(MUJER, { definiteness: 'this' }))).toBe(' de esta mujer');
    expect(bookOf(np(GATO, { definiteness: 'some', number: 'plural' }))).toBe(' de algunos gatos');
  });

  test('a proper possessor is bare unless inherently articled', () => {
    expect(bookOf(np(EUROPA))).toBe(' de Europa');
    expect(bookOf(np(ANTARTIDA))).toBe(' de la Antártida');
  });

  test('the possessor carries its own adjectives', () => {
    expect(bookOf(np(GATO, { number: 'plural' }, { adjectives: [adj(GRANDE)] }))).toBe(' de los gatos grandes');
    expect(bookOf(np(GATO, {}, { adjectives: [concept(PRIMERO, 'FIRST')] }))).toBe(' del primer gato');
  });

  test('possessors nest, and a possessor can carry a relative clause', () => {
    expect(bookOf(np(NINO, {}, { possessor: np(HOMBRE) }))).toBe(' del niño del hombre');
    expect(bookOf(np(GATO, {}, { relative: { headRole: 'subject', verbPhrase: vp(COMER) } }))).toBe(' del gato que come');
  });
});

describe('possessorText: the possessor question (P09-E14)', () => {
  test('the stand-in is de quién', () => {
    expect(bookOf(questionPossessor())).toBe(' de quién');
  });
});
