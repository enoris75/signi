import { describe, expect, test } from 'vitest';
import { dimensionRelation } from './dimensionRelation.js';

describe('dimensionRelation', () => {
  test.each(['quality', 'measure', 'extent'] as const)('a noun declaring %s heads the gloss with it', (relation) => {
    expect(dimensionRelation({ base: 'size', dimensionRelation: relation })).toBe(relation);
  });

  test('a noun declaring none, or an unknown relation, is an extent', () => {
    expect(dimensionRelation({ base: 'size' })).toBe('extent');
    expect(dimensionRelation({ base: 'size', dimensionRelation: 'means' })).toBe('extent');
  });
});
