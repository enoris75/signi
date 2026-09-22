import { describe, expect, test } from 'vitest';
import type { ResolvedRelativeClause } from '../../types.js';
import { BUCH, el, ESSEN, KATER, KATZE, MAN, MAUS, np, vp } from './de.fixtures.js';
import { relativeGloss } from './relativeGloss.js';

const eatenByOne: ResolvedRelativeClause = { headRole: 'directObject', subject: el(np(MAN)), verbPhrase: vp(ESSEN) };
const eats: ResolvedRelativeClause = { headRole: 'subject', verbPhrase: vp(ESSEN) };

describe('relativeGloss', () => {
  // `subordinateClause` gives ", die man isst,"; alone, the clause has nothing to be set off from.
  test('is the relative clause without the commas that set it off from a head', () => {
    expect(relativeGloss(np(MAUS, {}, { relative: eatenByOne }))).toBe('die man isst');
  });

  // The head is unsaid, but the pronoun still takes its gender and number, and the gap's case.
  test('the relative pronoun agrees with the unspoken head', () => {
    expect(relativeGloss(np(KATER, {}, { relative: eatenByOne }))).toBe('den man isst');
    expect(relativeGloss(np(BUCH, {}, { relative: eatenByOne }))).toBe('das man isst');
    expect(relativeGloss(np(KATER, {}, { relative: eats }))).toBe('der isst');
    expect(relativeGloss(np(KATZE, { number: 'plural' }, { relative: eats }))).toBe('die essen');
  });

  // Only the outer commas go: a relative nested in the clause keeps the ones around it.
  test('keeps the commas of a relative nested inside it', () => {
    const eatsAMouse: ResolvedRelativeClause = {
      headRole: 'subject', verbPhrase: vp(ESSEN), directObject: el(np(MAUS, { definiteness: 'definite' }, { relative: eatenByOne })),
    };
    expect(relativeGloss(np(KATER, {}, { relative: eatsAMouse }))).toBe('der die Maus, die man isst, isst');
  });
});
