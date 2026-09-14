import { describe, expect, test } from 'vitest';
import { pronounPossessor } from './possessive.js';

describe('pronounPossessor', () => {
  test('carries the pronoun\'s person, number and gender', () => {
    expect(pronounPossessor({ base: 'je', person: '1', number: 'singular' })).toEqual({ kind: 'pronominal', person: '1', number: 'singular' });
    expect(pronounPossessor({ base: 'vous', person: '2', number: 'plural' })).toEqual({ kind: 'pronominal', person: '2', number: 'plural' });
    expect(pronounPossessor({ base: 'sie', person: '3', number: 'singular', gender: 'fem' }))
      .toEqual({ kind: 'pronominal', person: '3', number: 'singular', gender: 'fem' });
  });

  test('reads any other person as the 3rd, a missing number as singular, and drops an unknown gender', () => {
    expect(pronounPossessor({ base: 'x', person: '4', gender: 'common' })).toEqual({ kind: 'pronominal', person: '3', number: 'singular' });
    expect(pronounPossessor({})).toEqual({ kind: 'pronominal', person: '3', number: 'singular' });
  });
});
