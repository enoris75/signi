import { describe, expect, test } from 'vitest';
import { adj, GRANDE } from './it.fixtures.js';
import { itDeg } from './itDeg.js';

describe('itDeg', () => {
  test('a positive adjective keeps its surface', () => {
    expect(itDeg(adj(GRANDE), 'grande')).toBe('grande');
  });

  test('comparative and superlative share più / meno', () => {
    // The article, not the adverb, separates "un gatto più grande" from "il gatto più grande" (C1).
    expect(itDeg(adj(GRANDE, { degree: 'more' }), 'grandi')).toBe('più grandi');
    expect(itDeg(adj(GRANDE, { degree: 'most' }), 'grande')).toBe('più grande');
    expect(itDeg(adj(GRANDE, { degree: 'less' }), 'grande')).toBe('meno grande');
    expect(itDeg(adj(GRANDE, { degree: 'least' }), 'grandi')).toBe('meno grandi');
  });

  test('equality takes the invariant ugualmente', () => {
    expect(itDeg(adj(GRANDE, { degree: 'equally' }), 'grande')).toBe('ugualmente grande');
  });

  test('an empty surface gets no dangling adverb', () => {
    expect(itDeg(adj(GRANDE, { degree: 'more' }), '')).toBe('');
  });
});
