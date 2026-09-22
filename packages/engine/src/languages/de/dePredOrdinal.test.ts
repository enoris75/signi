import { describe, expect, test } from 'vitest';
import type { Forms } from './de.fixtures.js';
import { adj, KATER, KATZE } from './de.fixtures.js';
import { dePredOrdinal } from './dePredOrdinal.js';

const ERSTE: Forms = { role: 'adjective', base: 'erste', ordinal: '1' };
const ZWEITE: Forms = { role: 'adjective', base: 'zweite', ordinal: '1' };

describe('dePredOrdinal', () => {
  test('the definite article and the capitalised ordinal, in the gender of what it is said of', () => {
    expect(dePredOrdinal(adj(ERSTE), KATER)).toBe('der Erste');
    expect(dePredOrdinal(adj(ERSTE), KATZE)).toBe('die Erste');
    expect(dePredOrdinal(adj(ZWEITE), { gender: 'neut' })).toBe('das Zweite');
  });

  test('the plural takes the weak -n after "die"', () => {
    expect(dePredOrdinal(adj(ERSTE), { ...KATER, number: 'plural' })).toBe('die Ersten');
  });
});
