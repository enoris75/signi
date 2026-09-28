import { describe, expect, test } from 'vitest';
import type { BoundPossessor } from '../../types.js';
import { isReflexivePossessor } from './isReflexivePossessor.js';

const bound: BoundPossessor = { kind: 'pronominal', person: '3', number: 'singular', gender: 'masc', coreferent: 'subject', human: false, own: false };

describe('isReflexivePossessor', () => {
  test('a possessor bound to the subject', () => {
    expect(isReflexivePossessor(bound, { person: '3', number: 'singular' })).toBe(true);
  });

  test('an unbound 3rd person is someone else\'s', () => {
    expect(isReflexivePossessor({ kind: 'pronominal', person: '3', number: 'singular' }, { person: '3', number: 'singular' })).toBe(false);
  });

  test('a 1st/2nd person possessor matching the subject', () => {
    expect(isReflexivePossessor({ kind: 'pronominal', person: '1', number: 'singular' }, { person: '1', number: 'singular' })).toBe(true);
    expect(isReflexivePossessor({ kind: 'pronominal', person: '1', number: 'singular' }, { person: '2', number: 'singular' })).toBe(false);
  });

  test('never outside a clause, nor in the subject itself', () => {
    expect(isReflexivePossessor(bound, undefined)).toBe(false);
  });
});
