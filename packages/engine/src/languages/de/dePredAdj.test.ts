import { describe, expect, test } from 'vitest';
import { adj, ALT, GROSS, GUT, HOCH, KLEIN, MUEDE } from './de.fixtures.js';
import { dePredAdj } from './dePredAdj.js';

describe('dePredAdj', () => {
  test('the positive is the undeclined base, not the attributive stem', () => {
    expect(dePredAdj(adj(MUEDE))).toBe('müde');
    expect(dePredAdj(adj(HOCH))).toBe('hoch');
  });

  test('the comparative is synthetic', () => {
    expect(dePredAdj(adj(MUEDE, { degree: 'more' }))).toBe('müder');
    expect(dePredAdj(adj(ALT, { degree: 'more' }))).toBe('älter');
    expect(dePredAdj(adj(GUT, { degree: 'more' }))).toBe('besser');
  });

  test('the superlative takes the am …sten frame', () => {
    expect(dePredAdj(adj(KLEIN, { degree: 'most' }))).toBe('am kleinsten');
    expect(dePredAdj(adj(ALT, { degree: 'most' }))).toBe('am ältesten');
    expect(dePredAdj(adj(MUEDE, { degree: 'most' }))).toBe('am müdesten');
  });

  test('a seeded superlative stem slots into the frame', () => {
    expect(dePredAdj(adj(GUT, { degree: 'most' }))).toBe('am besten');
    expect(dePredAdj(adj(GROSS, { degree: 'most' }))).toBe('am größten');
  });

  test('the periphrastic degrees prefix their adverb to the base', () => {
    expect(dePredAdj(adj(MUEDE, { degree: 'less' }))).toBe('weniger müde');
    expect(dePredAdj(adj(MUEDE, { degree: 'least' }))).toBe('am wenigsten müde');
    expect(dePredAdj(adj(MUEDE, { degree: 'equally' }))).toBe('gleich müde');
  });

  test('renders nothing without a base', () => {
    expect(dePredAdj(adj({ role: 'adjective' }, { degree: 'most' }))).toBe('');
  });
});
