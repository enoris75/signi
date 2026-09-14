import { describe, expect, test } from 'vitest';
import type { ResolvedRelativeClause } from '../types.js';
import { el, np, vp } from '../languages/resolved.fixtures.js';
import { isPlainLocativeGap } from './isPlainLocativeGap.js';

const ONE = { base: 'one', person: '3', number: 'singular', generic: '1' };
const LIVE = { base: 'live' };

const clause = (rest: Partial<ResolvedRelativeClause> = {}): ResolvedRelativeClause =>
  ({ headRole: 'locative', subject: el(np(ONE)), verbPhrase: vp(LIVE), ...rest });

describe('isPlainLocativeGap', () => {
  test('no relative clause is no gap', () => {
    expect(isPlainLocativeGap(undefined)).toBe(false);
  });

  // C07: "a place where one lives".
  test('a locative gap with no relation chosen is the plain place', () => {
    expect(isPlainLocativeGap(clause())).toBe(true);
  });

  test('choosing the default relation is the same gap as leaving it out', () => {
    expect(isPlainLocativeGap(clause({ headSpecifiers: [{ kind: 'path', value: 'in' }] }))).toBe(true);
  });

  test('a marked relation needs its preposition', () => {
    expect(isPlainLocativeGap(clause({ headSpecifiers: [{ kind: 'path', value: 'under' }] }))).toBe(false);
    expect(isPlainLocativeGap(clause({ headSpecifiers: [{ kind: 'path', value: 'in_front_of' }] }))).toBe(false);
  });

  test.each(['subject', 'directObject', 'predicative', 'route', 'source', 'direction', 'terminus'] as const)(
    'a %s gap is not locative',
    (headRole) => {
      expect(isPlainLocativeGap(clause({ headRole }))).toBe(false);
    },
  );
});
