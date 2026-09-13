import { describe, expect, test } from 'vitest';
import { AGUA, ANTARTIDA, CASA, DINERO, EUROPA, type Forms, GATO, IDIOMA, LIBRO, PALABRA, RATON } from './es.fixtures.js';
import { nounPhrase } from './nounPhrase.js';

/** A countable feminine noun with a stressed a- ("el águila", "las águilas"). */
const AGUILA: Forms = { base: 'águila', plural: 'águilas', gender: 'fem', stressed_a: '1', count: 'singular' };

describe('nounPhrase', () => {
  test('defaults to the definite article, agreeing in gender and number', () => {
    expect(nounPhrase(GATO)).toBe('el gato');
    expect(nounPhrase(CASA)).toBe('la casa');
    expect(nounPhrase(IDIOMA)).toBe('el idioma');
    expect(nounPhrase({ ...GATO, number: 'plural' })).toBe('los gatos');
    expect(nounPhrase({ ...CASA, number: 'plural' })).toBe('las casas');
  });

  test('reads the plural off number, falling back to count', () => {
    expect(nounPhrase({ ...LIBRO, count: 'plural' })).toBe('los libros');
    expect(nounPhrase({ ...LIBRO, count: 'plural', number: 'singular' })).toBe('el libro');
  });

  test('the indefinite article, and a bare noun', () => {
    expect(nounPhrase({ ...GATO, definiteness: 'indefinite' })).toBe('un gato');
    expect(nounPhrase({ ...CASA, definiteness: 'indefinite' })).toBe('una casa');
    expect(nounPhrase({ ...GATO, number: 'plural', definiteness: 'indefinite' })).toBe('unos gatos');
    expect(nounPhrase({ ...CASA, number: 'plural', definiteness: 'indefinite' })).toBe('unas casas');
    expect(nounPhrase({ ...LIBRO, number: 'plural', definiteness: 'bare' })).toBe('libros');
  });

  test('proximal and distal demonstratives', () => {
    expect(nounPhrase({ ...LIBRO, definiteness: 'this' })).toBe('este libro');
    expect(nounPhrase({ ...CASA, number: 'plural', definiteness: 'this' })).toBe('estas casas');
    expect(nounPhrase({ ...GATO, definiteness: 'that' })).toBe('ese gato');
    expect(nounPhrase({ ...PALABRA, number: 'plural', definiteness: 'that' })).toBe('esas palabras');
  });

  // The translator makes these quantifiers plural on a countable noun.
  test('the plural quantifiers agree in gender, and todos carries the article', () => {
    expect(nounPhrase({ ...GATO, number: 'plural', definiteness: 'some' })).toBe('algunos gatos');
    expect(nounPhrase({ ...CASA, number: 'plural', definiteness: 'many' })).toBe('muchas casas');
    expect(nounPhrase({ ...LIBRO, number: 'plural', definiteness: 'few' })).toBe('pocos libros');
    expect(nounPhrase({ ...GATO, number: 'plural', definiteness: 'all' })).toBe('todos los gatos');
    expect(nounPhrase({ ...CASA, number: 'plural', definiteness: 'all' })).toBe('todas las casas');
  });

  test('ningún/ninguna is singular even when a plural was asked for', () => {
    expect(nounPhrase({ ...RATON, definiteness: 'no' })).toBe('ningún ratón');
    expect(nounPhrase({ ...RATON, number: 'plural', definiteness: 'no' })).toBe('ningún ratón');
    expect(nounPhrase({ ...CASA, definiteness: 'no' })).toBe('ninguna casa');
  });

  test('a mass noun stays singular and takes the mass quantifiers', () => {
    expect(nounPhrase({ ...DINERO, definiteness: 'indefinite' })).toBe('dinero');
    expect(nounPhrase({ ...DINERO, definiteness: 'some' })).toBe('algo de dinero');
    expect(nounPhrase({ ...DINERO, definiteness: 'many' })).toBe('mucho dinero');
    expect(nounPhrase({ ...DINERO, definiteness: 'all' })).toBe('todo el dinero');
    expect(nounPhrase({ ...DINERO, definiteness: 'no' })).toBe('ningún dinero');
  });

  // "agua" is feminine, but a stressed a- takes the masculine singular article "el"/"un";
  // everything else stays feminine.
  test('a stressed-a noun takes el/un in the singular only', () => {
    expect(nounPhrase(AGUA)).toBe('el agua');
    expect(nounPhrase({ ...AGUILA, definiteness: 'indefinite' })).toBe('un águila');
    expect(nounPhrase({ ...AGUILA, number: 'plural' })).toBe('las águilas');
    expect(nounPhrase({ ...AGUA, definiteness: 'this' })).toBe('esta agua');
    expect(nounPhrase({ ...AGUA, definiteness: 'few' })).toBe('poca agua');
    expect(nounPhrase({ ...AGUA, definiteness: 'all' })).toBe('toda el agua');
  });

  test('a prenominal adjective lifts the stressed-a exception', () => {
    expect(nounPhrase(AGUA, { pre: 'primera', post: '' })).toBe('la primera agua');
    expect(nounPhrase({ ...AGUILA, definiteness: 'indefinite' }, { pre: 'primera', post: '' })).toBe('una primera águila');
  });

  test('a proper name goes bare whatever was chosen, unless it is inherently articled', () => {
    expect(nounPhrase(EUROPA)).toBe('Europa');
    expect(nounPhrase({ ...EUROPA, definiteness: 'this' })).toBe('Europa');
    expect(nounPhrase(ANTARTIDA)).toBe('la Antártida');
    expect(nounPhrase({ ...ANTARTIDA, definiteness: 'indefinite' })).toBe('la Antártida');
  });

  test('sets the adjectives around the noun, after the determiner', () => {
    expect(nounPhrase(GATO, { pre: '', post: 'grande' })).toBe('el gato grande');
    expect(nounPhrase({ ...CASA, definiteness: 'indefinite' }, { pre: 'primera', post: 'grande y vieja' })).toBe('una primera casa grande y vieja');
  });

  test('a pronominal possessive replaces the article, whatever determiner was picked', () => {
    expect(nounPhrase(GATO, undefined, 'mi')).toBe('mi gato');
    expect(nounPhrase({ ...CASA, number: 'plural', definiteness: 'indefinite' }, { pre: '', post: 'grandes' }, 'sus')).toBe('sus casas grandes');
  });
});
