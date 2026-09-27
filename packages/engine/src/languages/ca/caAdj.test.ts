import { describe, expect, test } from 'vitest';
import { adj, ALTRE, CASA, concept, el, GAT, GOS, GRAN, NEGRE, np, PRIMER } from './ca.fixtures.js';
import { caAdj } from './caAdj.js';

describe('caAdj', () => {
  test('agrees the adjectives from their stored forms and puts them after the noun', () => {
    expect(caAdj(np(CASA, { number: 'plural' }, { adjectives: [adj(NEGRE)] }))).toEqual({ pre: '', post: 'negres' });
  });

  test('the prenominal few precede', () => {
    expect(caAdj(np(GAT, {}, { adjectives: [concept(ALTRE, 'OTHER')] }))).toEqual({ pre: 'altre', post: '' });
    expect(caAdj(np(CASA, {}, { adjectives: [concept(PRIMER, 'FIRST')] }))).toEqual({ pre: 'primera', post: '' });
  });

  test('several postnominal ones are coordinated with i', () => {
    expect(caAdj(np(GAT, {}, { adjectives: [adj(GRAN), adj(NEGRE)] })).post).toBe('gran i negre');
  });

  test('a compared adjective with its standard goes last', () => {
    const cat = np(GAT, { definiteness: 'indefinite' }, {
      adjectives: [adj(GRAN, { degree: 'more', standard: '1' }), adj(NEGRE)],
      adjectiveStandard: { index: 0, standard: el(np(GOS)) },
    });
    expect(caAdj(cat).post).toBe('negre i més gran que el gos');
  });
});
