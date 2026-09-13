import { describe, expect, test } from 'vitest';
import { adj, GRAND } from './fr.fixtures.js';
import { frDeg } from './frDeg.js';

describe('frDeg', () => {
  test('leaves a positive adjective bare', () => {
    expect(frDeg(adj(GRAND), 'grande')).toBe('grande');
  });

  test('prefixes plus, moins or aussi for the comparative degrees', () => {
    expect(frDeg(adj(GRAND, { degree: 'more' }), 'grande')).toBe('plus grande');
    expect(frDeg(adj(GRAND, { degree: 'less' }), 'grand')).toBe('moins grand');
    expect(frDeg(adj(GRAND, { degree: 'equally' }), 'grands')).toBe('aussi grands');
  });

  test('the relative superlatives share the comparative adverb — the article is added elsewhere', () => {
    expect(frDeg(adj(GRAND, { degree: 'most' }), 'grand')).toBe('plus grand');
    expect(frDeg(adj(GRAND, { degree: 'least' }), 'grandes')).toBe('moins grandes');
  });

  test('an empty surface stays empty', () => {
    expect(frDeg(adj(GRAND, { degree: 'more' }), '')).toBe('');
  });
});
