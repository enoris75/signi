import { describe, expect, test } from 'vitest';
import { complement, complements, KATZE, MESSER, np, vp, WAEHLEN } from './de.fixtures.js';
import { meansClause } from './meansClause.js';

describe('meansClause', () => {
  const means = complements({
    instrumental: complement(np(MESSER, { definiteness: 'indefinite' }), [{ kind: 'abstraction', value: 'process' }], vp(WAEHLEN)),
  });

  test('renders the lifted instrument with its doer as the subject, or "man" without one', () => {
    expect(meansClause(means, KATZE)).toBe(', indem sie ein Messer wählt');
    expect(meansClause(means)).toBe(', indem man ein Messer wählt');
  });

  test('is empty when there is no means clause', () => {
    expect(meansClause(undefined, KATZE)).toBe('');
    expect(meansClause({})).toBe('');
  });
});
