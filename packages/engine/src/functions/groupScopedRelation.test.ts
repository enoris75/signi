import { TEMPORAL_RELATIONS } from '@signi/shared';
import { describe, expect, test } from 'vitest';
import { complement, np } from '../languages/resolved.fixtures.js';
import { groupScopedRelation } from './groupScopedRelation.js';

const HOUSE = { base: 'house' };
const DAY = { base: 'day' };
const between = complement(np(HOUSE), [{ kind: 'path', value: 'between' }]);

describe('groupScopedRelation', () => {
  test('between scopes over the group on all three spatial complements', () => {
    expect(groupScopedRelation('locative', between)).toBe('between');
    expect(groupScopedRelation('route', between)).toBe('between');
    expect(groupScopedRelation('direction', between)).toBe('between');
  });

  test('every other relation distributes', () => {
    expect(groupScopedRelation('locative', complement(np(HOUSE), [{ kind: 'path', value: 'on' }]))).toBeUndefined();
    expect(groupScopedRelation('route', complement(np(HOUSE), [{ kind: 'path', value: 'against' }]))).toBeUndefined();
  });

  test('a bare spatial complement falls back on a distributing default, and a bare direction has none', () => {
    expect(groupScopedRelation('locative', complement(np(HOUSE)))).toBeUndefined();
    expect(groupScopedRelation('route', complement(np(HOUSE)))).toBeUndefined();
    expect(groupScopedRelation('direction', complement(np(HOUSE)))).toBeUndefined();
  });

  test('a complement that is no spatial or temporal one has no relation to scope', () => {
    expect(groupScopedRelation('instrumental', between)).toBeUndefined();
  });

  // P09-E20: a time bounded on both sides scopes as a place between two landmarks does.
  test('a temporal between scopes over the group', () => {
    expect(groupScopedRelation('temporal', complement(np(DAY), [{ kind: 'temporal', value: 'between' }]))).toBe('between');
  });

  test('every other temporal relation distributes, and a bare temporal is the distributing at', () => {
    for (const value of TEMPORAL_RELATIONS.filter((r) => r !== 'between')) {
      expect(groupScopedRelation('temporal', complement(np(DAY), [{ kind: 'temporal', value }]))).toBeUndefined();
    }
    expect(groupScopedRelation('temporal', complement(np(DAY)))).toBeUndefined();
  });

  // The two families stay apart: a path `between` on a temporal, or a temporal one on a place, reads
  // as nothing chosen at all.
  test('a relation of the other family does not scope', () => {
    expect(groupScopedRelation('temporal', between)).toBeUndefined();
    expect(groupScopedRelation('locative', complement(np(HOUSE), [{ kind: 'temporal', value: 'between' }]))).toBeUndefined();
  });
});
