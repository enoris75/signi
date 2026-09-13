import { describe, expect, test } from 'vitest';
import { adj, BELO, BOM, CASA, concept, FORTE, GATO, GRANDE, np, PRIMEIRO, RATO, SEGUNDO, VELHO } from './pt.fixtures.js';
import { ptAdj } from './ptAdj.js';

describe('ptAdj', () => {
  test('no adjectives leaves both sides empty', () => {
    expect(ptAdj(np(GATO))).toEqual({ pre: '', post: '' });
  });

  test('a qualifying adjective follows the noun, agreed with its gender and number', () => {
    expect(ptAdj(np(CASA, {}, { adjectives: [adj(VELHO)] }))).toEqual({ pre: '', post: 'velha' });
    expect(ptAdj(np(GATO, { number: 'plural' }, { adjectives: [concept(BOM, 'GOOD')] }))).toEqual({ pre: '', post: 'bons' });
  });

  test('several postnominal adjectives are listed with commas and a final "e"', () => {
    const phrase = np(GATO, {}, { adjectives: [concept(GRANDE, 'BIG'), adj(VELHO), adj(BELO)] });
    expect(ptAdj(phrase).post).toBe('grande, velho e belo');
    const two = np(CASA, { number: 'plural' }, { adjectives: [concept(GRANDE, 'BIG'), adj(VELHO)] });
    expect(ptAdj(two).post).toBe('grandes e velhas');
  });

  test('an ordinal precedes the noun', () => {
    const phrase = np(CASA, { number: 'plural' }, { adjectives: [concept(PRIMEIRO, 'FIRST'), adj(FORTE)] });
    expect(ptAdj(phrase)).toEqual({ pre: 'primeiras', post: 'fortes' });
    expect(ptAdj(np(GATO, {}, { adjectives: [concept(SEGUNDO, 'SECOND')] }))).toEqual({ pre: 'segundo', post: '' });
  });

  test('a comparative follows the noun, suppletive or periphrastic', () => {
    const phrase = np(CASA, {}, { adjectives: [concept({ ...GRANDE, degree: 'more' }, 'BIG'), adj(VELHO, { degree: 'less' })] });
    expect(ptAdj(phrase)).toEqual({ pre: '', post: 'maior e menos velha' });
  });

  test('a no-determined phrase agrees its adjectives in the singular', () => {
    const phrase = np(RATO, { number: 'plural', definiteness: 'no' }, { adjectives: [adj(VELHO)] });
    expect(ptAdj(phrase).post).toBe('velho');
  });

  test('defaults to the masculine without a gender', () => {
    expect(ptAdj(np({ base: 'x' }, {}, { adjectives: [adj(VELHO)] })).post).toBe('velho');
  });
});
