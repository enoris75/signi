import { describe, expect, test } from 'vitest';
import { AFRICA, AGUA, ANTARTIDA, CASA, DINERO, GATO } from './es.fixtures.js';
import { artFor } from './artFor.js';

describe('artFor', () => {
  test('defaults to the definite article', () => {
    expect(artFor(GATO)).toBe('el');
    expect(artFor(CASA, true)).toBe('las');
  });

  test('indefinite, bare and the demonstratives', () => {
    expect(artFor({ ...GATO, definiteness: 'indefinite' })).toBe('un');
    expect(artFor({ ...CASA, definiteness: 'indefinite' }, true)).toBe('unas');
    expect(artFor({ ...GATO, definiteness: 'bare' }, true)).toBe('');
    expect(artFor({ ...CASA, definiteness: 'this' })).toBe('esta');
    expect(artFor({ ...GATO, definiteness: 'that' }, true)).toBe('esos');
  });

  test('the plural quantifiers agree in gender', () => {
    expect(artFor({ ...GATO, definiteness: 'some' }, true)).toBe('algunos');
    expect(artFor({ ...CASA, definiteness: 'some' }, true)).toBe('algunas');
    expect(artFor({ ...GATO, definiteness: 'many' }, true)).toBe('muchos');
    expect(artFor({ ...CASA, definiteness: 'few' }, true)).toBe('pocas');
  });

  test('todos / todas carry the plural definite article', () => {
    expect(artFor({ ...GATO, definiteness: 'all' }, true)).toBe('todos los');
    expect(artFor({ ...CASA, definiteness: 'all' }, true)).toBe('todas las');
  });

  test('no is the singular ningún / ninguna', () => {
    expect(artFor({ ...GATO, definiteness: 'no' })).toBe('ningún');
    expect(artFor({ ...CASA, definiteness: 'no' })).toBe('ninguna');
  });

  test('a mass noun takes no indefinite article and the singular quantifiers', () => {
    expect(artFor(AGUA)).toBe('el');
    expect(artFor({ ...AGUA, definiteness: 'indefinite' })).toBe('');
    expect(artFor({ ...AGUA, definiteness: 'bare' })).toBe('');
    expect(artFor({ ...AGUA, definiteness: 'some' })).toBe('algo de');
    expect(artFor({ ...AGUA, definiteness: 'many' })).toBe('mucha');
    expect(artFor({ ...DINERO, definiteness: 'many' })).toBe('mucho');
    expect(artFor({ ...AGUA, definiteness: 'few' })).toBe('poca');
    expect(artFor({ ...DINERO, definiteness: 'few' })).toBe('poco');
    expect(artFor({ ...DINERO, definiteness: 'no' })).toBe('ningún');
    expect(artFor({ ...AGUA, definiteness: 'no' })).toBe('ninguna');
  });

  test('a mass noun keeps its stressed-a article under todo but not under a demonstrative', () => {
    expect(artFor({ ...AGUA, definiteness: 'all' })).toBe('toda el');
    expect(artFor({ ...DINERO, definiteness: 'all' })).toBe('todo el');
    expect(artFor({ ...AGUA, definiteness: 'this' })).toBe('esta');
    expect(artFor({ ...DINERO, definiteness: 'that' })).toBe('ese');
  });

  test('a mass noun stays singular even when a plural is asked for', () => {
    expect(artFor(DINERO, true)).toBe('el');
    expect(artFor({ ...AGUA, definiteness: 'that' }, true)).toBe('esa');
  });

  test('a proper name goes bare whatever was chosen, unless it is inherently articled', () => {
    expect(artFor(AFRICA)).toBe('');
    expect(artFor({ ...AFRICA, definiteness: 'this' })).toBe('');
    expect(artFor(ANTARTIDA)).toBe('la');
    expect(artFor({ ...ANTARTIDA, definiteness: 'indefinite' })).toBe('la');
  });
});
