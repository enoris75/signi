import { describe, expect, test } from 'vitest';
import type { ResolvedNounPhrase } from '../../types.js';
import { adj, AGUA, ANTARTIDA, CASA, COMER, concept, EUROPA, GATO, GRANDE, HOMBRE, LIBRO, MUJER, NINO, np, PRIMERO, vp } from './es.fixtures.js';
import { possessorText } from './possessorText.js';

const bookOf = (possessor: ResolvedNounPhrase['possessor']) => possessorText(np(LIBRO, {}, { possessor }));

describe('possessorText', () => {
  test('a possessor\'s own possessive replaces its article after de', () => {
    expect(bookOf(np(NINO, {}, { possessor: { kind: 'pronominal', person: '1', number: 'singular' } }))).toBe(' de mi niño');
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
