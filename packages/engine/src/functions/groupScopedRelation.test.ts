import { describe, expect, test } from 'vitest';
import { complement, np } from '../languages/resolved.fixtures.js';
import { groupScopedRelation } from './groupScopedRelation.js';

const HOUSE = { base: 'house' };
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

  test('a complement that is no spatial one has no relation to scope', () => {
    expect(groupScopedRelation('instrumental', between)).toBeUndefined();
  });
});
