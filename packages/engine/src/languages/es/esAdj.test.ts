import { describe, expect, test } from 'vitest';
import { adj, AGUA, CASA, concept, el, FRIO, GATO, GRANDE, HERMOSO, MARRON, np, NUEVO, PERRO, PRIMERO, RATON, SEGUNDO, TERCERO, VIEJO } from './es.fixtures.js';
import { esAdj } from './esAdj.js';

describe('esAdj', () => {
  test('a noun without adjectives has nothing on either side', () => {
    expect(esAdj(np(GATO))).toEqual({ pre: '', post: '' });
  });

  test('a qualifying adjective follows the noun, agreeing with it', () => {
    expect(esAdj(np(CASA, {}, { adjectives: [adj(VIEJO)] }))).toEqual({ pre: '', post: 'vieja' });
    expect(esAdj(np(GATO, { number: 'plural' }, { adjectives: [adj(NUEVO)] }))).toEqual({ pre: '', post: 'nuevos' });
  });

  test('a stressed-a noun is still feminine for its adjectives', () => {
    expect(esAdj(np(AGUA, {}, { adjectives: [adj(FRIO)] })).post).toBe('fría');
  });

  test('several postnominal adjectives are coordinated', () => {
    const phrase = np(CASA, {}, { adjectives: [adj(GRANDE), adj(VIEJO), adj(HERMOSO)] });
    expect(esAdj(phrase).post).toBe('grande, vieja y hermosa');
  });

  test('a graded adjective takes its degree adverb', () => {
    const phrase = np(GATO, {}, { adjectives: [adj(GRANDE, { degree: 'more' }), adj(VIEJO)] });
    expect(esAdj(phrase).post).toBe('más grande y viejo');
  });

  test('an ordinal precedes the noun, shortened before a masculine singular', () => {
    expect(esAdj(np(GATO, {}, { adjectives: [concept(PRIMERO, 'FIRST'), adj(GRANDE)] }))).toEqual({ pre: 'primer', post: 'grande' });
    expect(esAdj(np(CASA, {}, { adjectives: [concept(TERCERO, 'THIRD')] }))).toEqual({ pre: 'tercera', post: '' });
    expect(esAdj(np(GATO, { number: 'plural' }, { adjectives: [concept(SEGUNDO, 'SECOND')] }))).toEqual({ pre: 'segundos', post: '' });
  });

  test('a no-determined phrase agrees singular even when a plural was asked for', () => {
    const phrase = np(RATON, { number: 'plural', definiteness: 'no' }, { adjectives: [adj(GRANDE)] });
    expect(esAdj(phrase).post).toBe('grande');
  });

  test('skips an adjective with no Spanish form', () => {
    expect(esAdj(np(CASA, {}, { adjectives: [adj({ role: 'adjective' }), adj(VIEJO)] })).post).toBe('vieja');
  });
});

describe('esAdj: the compared adjective with a standard (P09-E18)', () => {
  test('is written with it and coordinated last', () => {
    const phrase = np(GATO, {}, {
      adjectives: [adj(GRANDE, { degree: 'more', standard: '1' }), adj(MARRON)],
      adjectiveStandard: { index: 0, standard: el(np(PERRO, { definiteness: 'definite' })) },
    });
    expect(esAdj(phrase).post).toBe('marrón y más grande que el perro');
  });
});
