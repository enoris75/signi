import { describe, expect, test } from 'vitest';
import type { ResolvedRelativeClause } from '../types.js';
import { relativeGapType } from './relativeGapType.js';

const rel = (headRole: ResolvedRelativeClause['headRole']): ResolvedRelativeClause =>
  ({ headRole, verbPhrase: { verb: { conceptId: 'BE', forms: {} }, modals: [] } });

describe('relativeGapType', () => {
  test('a complement gap gives its slot', () => {
    expect(relativeGapType(rel('locative'))).toBe('locative');
    expect(relativeGapType(rel('terminus'))).toBe('terminus');
    expect(relativeGapType(rel('cause'))).toBe('cause');
    expect(relativeGapType(rel('predicative'))).toBe('predicative');
  });

  test('the four non-complement roles give undefined', () => {
    expect(relativeGapType(rel('subject'))).toBeUndefined();
    expect(relativeGapType(rel('directObject'))).toBeUndefined();
    expect(relativeGapType(rel('possessor'))).toBeUndefined();
    expect(relativeGapType(rel('agent'))).toBeUndefined();
  });
});
