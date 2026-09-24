import { describe, expect, test } from 'vitest';
import { adj, BIG, BROWN, CAT, LAZY, np } from './en.fixtures.js';
import { npAdj } from './npAdj.js';

describe('npAdj', () => {
  test('joins the adjectives in order, each at its own degree', () => {
    expect(npAdj(np(CAT, {}, { adjectives: [adj(BIG, { degree: 'more' }), adj(BROWN)] }))).toBe('bigger brown');
  });

  // A328: an OWN bound to a possessive that detaches leaves the adjectives; beside a prenominal one it stays.
  test('drops a possessor-bound OWN where the possessive detaches', () => {
    const OWN = { role: 'adjective', base: 'own' };
    const mine = { kind: 'pronominal', person: '1', number: 'singular' } as const;
    const adjectives = [adj(OWN, { possessor_bound: '1' }), adj(LAZY)];
    expect(npAdj(np(CAT, { definiteness: 'indefinite' }, { possessor: mine, adjectives }))).toBe('lazy');
    expect(npAdj(np(CAT, { definiteness: 'definite' }, { possessor: mine, adjectives }))).toBe('own lazy');
  });

  test('a phrase with no adjectives gives an empty string', () => {
    expect(npAdj(np(CAT))).toBe('');
  });

  test('skips an adjective with no English base', () => {
    expect(npAdj(np(CAT, {}, { adjectives: [adj({ role: 'adjective' }), adj(LAZY)] }))).toBe('lazy');
  });
});
