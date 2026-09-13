import { describe, expect, test } from 'vitest';
import { adj, CASA, concept, el, type Forms, GATO, group, LIBRO, NINO, NOSOTROS, np, PERRO, PRIMERO, VIEJO, vp, YO } from './es.fixtures.js';
import { subjectText } from './subjectText.js';

const LLORAR: Forms = { base: 'llorar', '3sg_present': 'llora', '3pl_present': 'lloran' };

describe('subjectText', () => {
  test('a noun subject carries its determiner and agreed adjectives', () => {
    expect(subjectText(el(np(GATO)))).toBe('el gato');
    expect(subjectText(el(np(CASA, { definiteness: 'indefinite' }, { adjectives: [adj(VIEJO)] })))).toBe('una casa vieja');
    expect(subjectText(el(np(GATO, {}, { adjectives: [concept(PRIMERO, 'FIRST')] })))).toBe('el primer gato');
  });

  test('a pronoun subject is the bare pronoun', () => {
    expect(subjectText(el(np(YO)))).toBe('yo');
    expect(subjectText(el(np(NOSOTROS)))).toBe('nosotros');
  });

  test('each conjunct keeps its own surface', () => {
    expect(subjectText(el(np(GATO), np(CASA, { number: 'plural' })))).toBe('el gato y las casas');
    expect(subjectText(el(np(GATO), np(YO)))).toBe('el gato y yo');
    expect(subjectText(group('or', np(PERRO), np(GATO, { definiteness: 'indefinite' })))).toBe('el perro o un gato');
  });

  test('a pronominal possessor replaces the article', () => {
    const possessor = { kind: 'pronominal', person: '3', number: 'singular' } as const;
    expect(subjectText(el(np(PERRO, {}, { possessor })))).toBe('su perro');
    expect(subjectText(el(np(PERRO, { number: 'plural' }, { possessor })))).toBe('sus perros');
  });

  test('a noun possessor and a relative clause trail the noun', () => {
    expect(subjectText(el(np(LIBRO, {}, { possessor: np(NINO) })))).toBe('el libro del niño');
    expect(subjectText(el(np(NINO, {}, { relative: { headRole: 'subject', verbPhrase: vp(LLORAR) } })))).toBe('el niño que llora');
  });
});
