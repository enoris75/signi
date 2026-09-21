import { describe, expect, test } from 'vitest';
import type { NounGroup, NounPhrase } from '@signi/shared';
import { controlledSubject } from './controlledSubject.js';

describe('controlledSubject', () => {
  // A171: a `no` controller negates the matrix clause, so the embedded clause takes it as the definite.
  test('gives up the `no` of a controller for the definite, and keeps the rest of the phrase', () => {
    const noCat: NounPhrase = { concept: 'CAT', definiteness: 'no', number: 'plural', gender: 'fem' };
    expect(controlledSubject(noCat)).toEqual({ concept: 'CAT', definiteness: 'definite', number: 'plural', gender: 'fem' });
    expect(noCat.definiteness).toBe('no');
  });

  test('hands back a controller with any other determiner as it is', () => {
    for (const definiteness of ['definite', 'indefinite', 'some', 'all', 'few'] as const) {
      const cat: NounPhrase = { concept: 'CAT', definiteness };
      expect(controlledSubject(cat)).toBe(cat);
    }
    const bare: NounPhrase = { concept: 'HE' };
    expect(controlledSubject(bare)).toBe(bare);
  });

  test('gives up the `no` of every conjunct of a group, and only theirs', () => {
    const group: NounGroup = {
      conjuncts: [{ concept: 'CAT', definiteness: 'no' }, { concept: 'DOG', definiteness: 'indefinite' }],
      conjunction: 'or',
    };
    expect(controlledSubject(group)).toEqual({
      conjuncts: [{ concept: 'CAT', definiteness: 'definite' }, { concept: 'DOG', definiteness: 'indefinite' }],
      conjunction: 'or',
    });
    const positive: NounGroup = { conjuncts: [{ concept: 'CAT' }, { concept: 'DOG' }], conjunction: 'and' };
    expect(controlledSubject(positive)).toBe(positive);
  });
});
