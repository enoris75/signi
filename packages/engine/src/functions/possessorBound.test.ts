import { describe, expect, test } from 'vitest';
import type { ConceptForms, ResolvedNounPhrase } from '../types.js';
import { possessorBound } from './possessorBound.js';

const adj = (conceptId: string, forms: Record<string, string> = {}): ConceptForms => ({ conceptId, forms });
const phrase = (adjectives: ConceptForms[]): ResolvedNounPhrase =>
  ({ head: adj('CAT', { base: 'cat' }), adjectives, nounModifiers: [] });

describe('possessorBound', () => {
  test('finds the marked adjective wherever it stands', () => {
    const own = adj('OWN_ADJECTIVE', { base: 'own', possessor_bound: '1' });
    expect(possessorBound(phrase([own, adj('BIG', { base: 'big' })]))).toBe(own);
    expect(possessorBound(phrase([adj('BIG', { base: 'big' }), own]))).toBe(own);
  });

  test('ordinary adjectives are not it', () => {
    expect(possessorBound(phrase([adj('BIG', { base: 'big' })]))).toBeUndefined();
    expect(possessorBound(phrase([]))).toBeUndefined();
  });
});
