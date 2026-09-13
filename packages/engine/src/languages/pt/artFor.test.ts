import { describe, expect, test } from 'vitest';
import { AFRICA, AGUA, CASA, CUIDADO, DINHEIRO, EUROPA, GATO, LIVRO } from './pt.fixtures.js';
import { artFor } from './artFor.js';

describe('artFor', () => {
  test('defaults to the definite article', () => {
    expect(artFor(GATO)).toBe('o');
    expect(artFor(CASA, true)).toBe('as');
  });

  test('indefinite and bare', () => {
    expect(artFor({ ...LIVRO, definiteness: 'indefinite' })).toBe('um');
    expect(artFor({ ...CASA, definiteness: 'indefinite' }, true)).toBe('umas');
    expect(artFor({ ...LIVRO, definiteness: 'bare' }, true)).toBe('');
  });

  test('demonstratives agree in gender and number', () => {
    expect(artFor({ ...CASA, definiteness: 'this' })).toBe('esta');
    expect(artFor({ ...GATO, definiteness: 'that' }, true)).toBe('esses');
  });

  // The translator forces these quantifiers plural on a countable noun.
  test('plural quantifiers agree in gender, "todos/todas" with the definite article', () => {
    expect(artFor({ ...GATO, definiteness: 'some' }, true)).toBe('alguns');
    expect(artFor({ ...CASA, definiteness: 'many' }, true)).toBe('muitas');
    expect(artFor({ ...LIVRO, definiteness: 'few' }, true)).toBe('poucos');
    expect(artFor({ ...CASA, definiteness: 'all' }, true)).toBe('todas as');
  });

  test('"nenhum/nenhuma" is singular', () => {
    expect(artFor({ ...GATO, definiteness: 'no' })).toBe('nenhum');
    expect(artFor({ ...CASA, definiteness: 'no' })).toBe('nenhuma');
  });

  test('a mass noun takes no indefinite article and singular quantifiers', () => {
    expect(artFor(AGUA)).toBe('a');
    expect(artFor({ ...AGUA, definiteness: 'indefinite' })).toBe('');
    expect(artFor({ ...AGUA, definiteness: 'bare' })).toBe('');
    expect(artFor({ ...AGUA, definiteness: 'some' })).toBe('um pouco de');
    expect(artFor({ ...AGUA, definiteness: 'many' })).toBe('muita');
    expect(artFor({ ...CUIDADO, definiteness: 'many' })).toBe('muito');
    expect(artFor({ ...AGUA, definiteness: 'few' })).toBe('pouca');
    expect(artFor({ ...DINHEIRO, definiteness: 'few' })).toBe('pouco');
    expect(artFor({ ...AGUA, definiteness: 'all' })).toBe('toda a');
    expect(artFor({ ...DINHEIRO, definiteness: 'all' })).toBe('todo o');
    expect(artFor({ ...DINHEIRO, definiteness: 'no' })).toBe('nenhum');
  });

  test('a mass noun keeps the singular demonstrative', () => {
    expect(artFor({ ...AGUA, definiteness: 'this' })).toBe('esta');
    expect(artFor({ ...DINHEIRO, definiteness: 'that' })).toBe('esse');
  });

  test('a proper noun always takes the definite article, whatever was picked', () => {
    expect(artFor(AFRICA)).toBe('a');
    expect(artFor({ ...EUROPA, definiteness: 'indefinite' })).toBe('a');
    expect(artFor({ ...EUROPA, definiteness: 'this' })).toBe('a');
    expect(artFor({ ...AFRICA, definiteness: 'bare' })).toBe('a');
  });
});
