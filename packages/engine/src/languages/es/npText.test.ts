import { describe, expect, test } from 'vitest';
import {
  adj, AGUA, CASA, COMER, COMIDA, concept, CREADOR, el, FRASE, FUERTE, GATO, GRANDE, HERMOSO, INTERESANTE, LIBRO, NINO,
  nounModifier, np, PALABRA, PRIMERO, SEGUNDO, SEMANTICO, TERCERO, VIEJO, vp,
} from './es.fixtures.js';
import { npText } from './npText.js';

describe('npText', () => {
  test('a noun phrase with its own determiner', () => {
    expect(npText(np(PALABRA, { definiteness: 'indefinite' }))).toBe('una palabra');
    expect(npText(np(LIBRO, { number: 'plural' }))).toBe('los libros');
  });

  test('qualifying adjectives follow the noun and agree with it', () => {
    expect(npText(np(CASA, { number: 'plural' }, { adjectives: [adj(VIEJO)] }))).toBe('las casas viejas');
    expect(npText(np(GATO, {}, { adjectives: [adj(GRANDE), adj(VIEJO), adj(HERMOSO)] }))).toBe('el gato grande, viejo y hermoso');
    expect(npText(np(GATO, {}, { adjectives: [adj(FUERTE), adj(INTERESANTE)] }))).toBe('el gato fuerte e interesante');
  });

  test('an ordinal precedes the noun, primero and tercero shortening before a masculine singular', () => {
    expect(npText(np(LIBRO, {}, { adjectives: [concept(PRIMERO, 'FIRST')] }))).toBe('el primer libro');
    expect(npText(np(LIBRO, {}, { adjectives: [concept(TERCERO, 'THIRD')] }))).toBe('el tercer libro');
    expect(npText(np(LIBRO, {}, { adjectives: [concept(SEGUNDO, 'SECOND')] }))).toBe('el segundo libro');
    expect(npText(np(CASA, {}, { adjectives: [concept(PRIMERO, 'FIRST')] }))).toBe('la primera casa');
    expect(npText(np(LIBRO, { number: 'plural' }, { adjectives: [concept(PRIMERO, 'FIRST'), adj(GRANDE)] }))).toBe('los primeros libros grandes');
  });

  // C1: the comparative and the relative superlative coincide once the article is there.
  test('a degree adverb leads its adjective', () => {
    expect(npText(np(GATO, {}, { adjectives: [adj(GRANDE, { degree: 'more' })] }))).toBe('el gato más grande');
    expect(npText(np(GATO, {}, { adjectives: [adj(GRANDE, { degree: 'most' })] }))).toBe('el gato más grande');
    expect(npText(np(GATO, { definiteness: 'indefinite' }, { adjectives: [adj(HERMOSO, { degree: 'less' })] }))).toBe('un gato menos hermoso');
    expect(npText(np(GATO, {}, { adjectives: [adj(GRANDE, { degree: 'equally' })] }))).toBe('el gato igual de grande');
  });

  test('a prenominal adjective lifts the stressed-a article', () => {
    expect(npText(np(AGUA))).toBe('el agua');
    expect(npText(np(AGUA, {}, { adjectives: [concept(PRIMERO, 'FIRST')] }))).toBe('la primera agua');
  });

  test('a pronominal possessor replaces the article', () => {
    expect(npText(np(CASA, { definiteness: 'bare' }, { possessor: { kind: 'pronominal', person: '1', number: 'singular' } }))).toBe('mi casa');
    // …but not the indefinite one, which keeps its slot as a demonstrative does (A277).
    expect(npText(np(CASA, { definiteness: 'indefinite' }, { possessor: { kind: 'pronominal', person: '1', number: 'singular' } }))).toBe('una casa mía');
  });

  test('attributive nouns, the possessor and a relative clause trail the noun', () => {
    const modifier = nounModifier({ ...FRASE, number: 'plural' }, [adj(SEMANTICO)]);
    expect(npText(np(CREADOR, {}, { nounModifiers: [modifier] }))).toBe('el creador de frases semánticas');
    expect(npText(np(LIBRO, {}, { possessor: np(NINO) }))).toBe('el libro del niño');
    const eats = { headRole: 'subject' as const, verbPhrase: vp(COMER), directObject: el(np(COMIDA)) };
    expect(npText(np(GATO, { definiteness: 'indefinite' }, { relative: eats }))).toBe('un gato que come la comida');
  });
});
