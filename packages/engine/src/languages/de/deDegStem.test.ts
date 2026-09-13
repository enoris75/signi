import { describe, expect, test } from 'vitest';
import { adj, ALT, GROSS, GUT, HOCH, KLEIN, MUEDE } from './de.fixtures.js';
import { deDegStem } from './deDegStem.js';

describe('deDegStem', () => {
  test('the positive declines the base, or a seeded attributive stem', () => {
    expect(deDegStem(adj(KLEIN), 'klein')).toBe('klein');
    expect(deDegStem(adj(HOCH), 'hoch')).toBe('hoh');
  });

  test('the comparative adds -er to the stem, umlauted when flagged', () => {
    expect(deDegStem(adj(KLEIN, { degree: 'more' }), 'klein')).toBe('kleiner');
    expect(deDegStem(adj(ALT, { degree: 'more' }), 'alt')).toBe('älter');
    expect(deDegStem(adj(MUEDE, { degree: 'more' }), 'müde')).toBe('müder');
    expect(deDegStem(adj(GROSS, { degree: 'more' }), 'groß')).toBe('größer');
  });

  test('the superlative adds -(e)st to the stem, umlauted when flagged', () => {
    expect(deDegStem(adj(KLEIN, { degree: 'most' }), 'klein')).toBe('kleinst');
    expect(deDegStem(adj(ALT, { degree: 'most' }), 'alt')).toBe('ältest');
  });

  test('a seeded comparative or superlative wins over the rule', () => {
    expect(deDegStem(adj(GUT, { degree: 'more' }), 'gut')).toBe('besser');
    expect(deDegStem(adj(GUT, { degree: 'most' }), 'gut')).toBe('best');
    expect(deDegStem(adj(GROSS, { degree: 'most' }), 'groß')).toBe('größt');
  });

  test('the periphrastic degrees keep the positive stem', () => {
    expect(deDegStem(adj(KLEIN, { degree: 'less' }), 'klein')).toBe('klein');
    expect(deDegStem(adj(HOCH, { degree: 'equally' }), 'hoch')).toBe('hoh');
  });
});
