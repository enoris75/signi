import { describe, expect, test } from 'vitest';
import { COORD_CONJUNCTIONS } from '@signi/shared';
import { coordConjunction } from './coordConjunction.js';

describe('coordConjunction', () => {
  test.each(COORD_CONJUNCTIONS)('%s joins two statements as it is', (conjunction) => {
    expect(coordConjunction(conjunction, false)).toBe(conjunction);
  });

  test.each(['and', 'then', 'but', 'or'] as const)('%s can join two commands', (conjunction) => {
    expect(coordConjunction(conjunction, true)).toBe(conjunction);
  });

  test.each(['therefore', 'that_is'] as const)('%s cannot join two commands, which fall back to and', (conjunction) => {
    expect(coordConjunction(conjunction, true)).toBe('and');
  });
});
