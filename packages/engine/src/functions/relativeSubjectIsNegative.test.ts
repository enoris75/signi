import { describe, expect, test } from 'vitest';
import type { ResolvedRelativeClause } from '../types.js';
import { el, group, np, vp } from '../languages/resolved.fixtures.js';
import { relativeSubjectIsNegative } from './relativeSubjectIsNegative.js';

const CAT = { base: 'cat', person: '3', number: 'singular' };
const DOG = { base: 'dog', person: '3', number: 'singular' };
const EAT = { base: 'eat' };
const noCat = np(CAT, { definiteness: 'no' });

const relative = (rest: Partial<ResolvedRelativeClause>): ResolvedRelativeClause =>
  ({ headRole: 'directObject', verbPhrase: vp(EAT), ...rest });

describe('relativeSubjectIsNegative', () => {
  // A166: "the mouse that no cat eats", "the house where no cat runs".
  test.each(['directObject', 'locative', 'terminus', 'agent'] as const)(
    'a %s relative\'s own `no` subject negates it',
    (headRole) => {
      expect(relativeSubjectIsNegative(relative({ headRole, subject: el(noCat) }))).toBe(true);
    },
  );

  test('a definite subject of its own does not', () => {
    expect(relativeSubjectIsNegative(relative({ subject: el(np(CAT)) }))).toBe(false);
  });

  // The group is negative as the translator marks it: any `no` conjunct.
  test('a coordinated subject counts when the group is marked negative', () => {
    expect(relativeSubjectIsNegative(relative({ subject: group('or', np(DOG), noCat) }))).toBe(true);
  });

  // A167: a subject relative has no subject of its own; its `no` head negates the matrix clause.
  test('a subject relative never counts, whatever its head', () => {
    expect(relativeSubjectIsNegative(relative({ headRole: 'subject' }))).toBe(false);
    expect(relativeSubjectIsNegative(relative({ headRole: 'directObject', subject: undefined }))).toBe(false);
  });

  // The possessive relativizer takes the possessed phrase's determiner: "whose cat", "il cui gatto".
  test('a genitive relative\'s possessed phrase never counts', () => {
    expect(relativeSubjectIsNegative(relative({ headRole: 'possessor', subject: el(noCat) }))).toBe(false);
  });
});
