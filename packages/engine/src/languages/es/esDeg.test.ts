import { describe, expect, test } from 'vitest';
import { adj, GRANDE, VIEJO } from './es.fixtures.js';
import { esDeg } from './esDeg.js';

describe('esDeg', () => {
  test('a positive adjective keeps its bare surface', () => {
    expect(esDeg(adj(GRANDE), 'grande')).toBe('grande');
  });

  test('the comparative prefixes más, the diminutive menos', () => {
    expect(esDeg(adj(GRANDE, { degree: 'more' }), 'grandes')).toBe('más grandes');
    expect(esDeg(adj(VIEJO, { degree: 'less' }), 'vieja')).toBe('menos vieja');
  });

  test('the relative superlative shares the comparative adverb', () => {
    // C01: the noun's definite article is what makes "el gato más grande" a superlative.
    expect(esDeg(adj(GRANDE, { degree: 'most' }), 'grande')).toBe('más grande');
    expect(esDeg(adj(VIEJO, { degree: 'least' }), 'viejos')).toBe('menos viejos');
  });

  test('equality prefixes the invariant igual de', () => {
    expect(esDeg(adj(VIEJO, { degree: 'equally' }), 'viejas')).toBe('igual de viejas');
  });

  test('an empty surface stays empty', () => {
    expect(esDeg(adj(GRANDE, { degree: 'more' }), '')).toBe('');
  });
});
