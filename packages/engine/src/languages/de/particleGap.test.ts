import { describe, expect, test } from 'vitest';
import { particleGap } from './particleGap.js';

describe('particleGap', () => {
  test('a particle written onto its verb joins it with nothing', () => {
    expect(particleGap({ base: 'hinzufügen', particle: 'hinzu' })).toBe('');
  });

  // B40: "rückgängig machen" keeps its particle a word of its own wherever the two meet.
  test('a particle written apart from its verb joins it with a space', () => {
    expect(particleGap({ base: 'rückgängig machen', particle: 'rückgängig' })).toBe(' ');
  });

  test('a verb without a particle has no gap', () => {
    expect(particleGap({ base: 'essen' })).toBe('');
  });
});
