import { describe, expect, test } from 'vitest';
import { adj, BELO, BOM, CAO, CASA, concept, el, FORTE, GATO, GRANDE, MULHER, np, PRIMEIRO, RATO, SEGUNDO, VELHO } from './pt.fixtures.js';
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

  // A313: "suficientes gatos seus", but "gatos suficientes" with no pronominal possessive.
  test('enough leads the noun beside a pronominal possessive, and closes it otherwise', () => {
    const mine = { possessor: { kind: 'pronominal', person: '1', number: 'singular' } as const };
    expect(ptAdj(np(GATO, { number: 'plural', definiteness: 'enough' }, { ...mine, adjectives: [adj(VELHO)] })))
      .toEqual({ pre: 'suficientes', post: 'velhos' });
    expect(ptAdj(np(GATO, { number: 'plural', definiteness: 'enough' }, { adjectives: [adj(VELHO)] })))
      .toEqual({ pre: '', post: 'velhos suficientes' });
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

  // A178: at `most` a suppletive stands before the noun ("o maior gato"), where after it it would
  // read as the comparative. A periphrastic superlative keeps its postnominal place.
  test('a suppletive superlative precedes the noun, a periphrastic one follows it', () => {
    expect(ptAdj(np(GATO, {}, { adjectives: [concept({ ...GRANDE, degree: 'most' }, 'BIG')] })))
      .toEqual({ pre: 'maior', post: '' });
    expect(ptAdj(np(GATO, { number: 'plural' }, { adjectives: [concept({ ...BOM, degree: 'most' }, 'GOOD')] })))
      .toEqual({ pre: 'melhores', post: '' });
    expect(ptAdj(np(CASA, {}, { adjectives: [adj(BELO, { degree: 'most' })] })))
      .toEqual({ pre: '', post: 'mais bela' });
    // It leads the prenominal list's other members out of the postnominal one, which keeps its own.
    expect(ptAdj(np(GATO, {}, { adjectives: [concept({ ...GRANDE, degree: 'most' }, 'BIG'), adj(VELHO)] })))
      .toEqual({ pre: 'maior', post: 'velho' });
  });

  test('a no-determined phrase agrees its adjectives in the singular', () => {
    const phrase = np(RATO, { number: 'plural', definiteness: 'no' }, { adjectives: [adj(VELHO)] });
    expect(ptAdj(phrase).post).toBe('velho');
  });

  test('defaults to the masculine without a gender', () => {
    expect(ptAdj(np({ base: 'x' }, {}, { adjectives: [adj(VELHO)] })).post).toBe('velho');
  });
});

describe('ptAdj: the compared adjective with a standard (P09-E18)', () => {
  test('is written with it and coordinated last', () => {
    const phrase = np(GATO, {}, {
      adjectives: [adj(GRANDE, { degree: 'more', standard: '1' }), adj(VELHO)],
      adjectiveStandard: { index: 0, standard: el(np(CAO, { definiteness: 'definite' })) },
    });
    expect(ptAdj(phrase).post).toBe('velho e maior do que o cão');
  });

  test('beside a genitive possessor they trail it instead of following the noun (A372)', () => {
    const phrase = np(GATO, {}, {
      adjectives: [adj(GRANDE, { degree: 'more', standard: '1' }), adj(VELHO)],
      adjectiveStandard: { index: 0, standard: el(np(CAO, { definiteness: 'definite' })) },
      possessor: np(MULHER, { definiteness: 'definite' }),
    });
    expect(ptAdj(phrase)).toEqual({ pre: '', post: '', trail: 'velho e maior do que o cão' });
  });

  test('a prenominal superlative\'s set closes the post-nominal ones, and alone trails a possessor (A371)', () => {
    const set = { index: 1, standard: el(np(CASA, { definiteness: 'definite', number: 'plural' })) };
    const adjectives = [adj(VELHO), adj(GRANDE, { degree: 'most', domain: '1' })];
    expect(ptAdj(np(GATO, {}, { adjectives, adjectiveStandard: set }))).toEqual({ pre: 'maior', post: 'velho das casas' });
    expect(ptAdj(np(GATO, {}, { adjectives, adjectiveStandard: set, possessor: np(MULHER, { definiteness: 'definite' }) })))
      .toEqual({ pre: 'maior', post: 'velho', trail: 'das casas' });
  });
});
