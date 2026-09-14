import { describe, expect, test } from 'vitest';
import { mannerRelation } from './mannerRelation.js';

describe('mannerRelation', () => {
  test.each(['means', 'measure', 'mode', 'similative'] as const)('a noun declaring %s heads the adverbial with it', (relation) => {
    expect(mannerRelation({ base: 'speed', mannerRelation: relation })).toBe(relation);
  });

  test('a noun declaring none, or an unknown relation, is a similative', () => {
    expect(mannerRelation({ base: 'cat' })).toBe('similative');
    expect(mannerRelation({ base: 'cat', mannerRelation: 'extent' })).toBe('similative');
  });
});
