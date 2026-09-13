import { describe, expect, test } from 'vitest';
import { adj, KLEIN } from './de.fixtures.js';
import { deDegPrefix } from './deDegPrefix.js';

describe('deDegPrefix', () => {
  test('prefixes weniger, am wenigsten and gleich for the periphrastic degrees', () => {
    expect(deDegPrefix(adj(KLEIN, { degree: 'less' }))).toBe('weniger ');
    expect(deDegPrefix(adj(KLEIN, { degree: 'least' }))).toBe('am wenigsten ');
    expect(deDegPrefix(adj(KLEIN, { degree: 'equally' }))).toBe('gleich ');
  });

  test('adds nothing for the positive and the synthetic degrees', () => {
    expect(deDegPrefix(adj(KLEIN))).toBe('');
    expect(deDegPrefix(adj(KLEIN, { degree: 'more' }))).toBe('');
    expect(deDegPrefix(adj(KLEIN, { degree: 'most' }))).toBe('');
  });
});
