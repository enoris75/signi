import { describe, expect, test } from 'vitest';
import { adj, AUTER, BUN, concept, GROND, PITSCHEN } from './rumgr.fixtures.js';
import { prenominalChain } from './prenominalChain.js';

describe('prenominalChain', () => {
  test('each adjective agrees with the noun from its stored forms', () => {
    expect(prenominalChain([adj(BUN)], 'masc', false)).toEqual(['bun']);
    expect(prenominalChain([adj(BUN)], 'fem', false)).toEqual(['buna']);
    expect(prenominalChain([adj(PITSCHEN)], 'fem', true)).toEqual(['pitschnas']);
    expect(prenominalChain([concept(AUTER, 'OTHER'), adj(GROND)], 'fem', true)).toEqual(['autras', 'grondas']);
  });

  test('no suppletion: bun stays bun before any noun', () => {
    expect(prenominalChain([adj(BUN)], 'masc', true)).toEqual(['buns']);
  });

  test('carries an intensifier, and drops an empty adjective', () => {
    expect(prenominalChain([adj(GROND, { intensifier: 'fitg' })], 'masc', false)).toEqual(['fitg grond']);
    expect(prenominalChain([adj({})], 'masc', false)).toEqual([]);
  });
});
