import { describe, expect, test } from 'vitest';
import { adj, ANIMAL, el, GOS, GRAN, JO, np } from './ca.fixtures.js';
import { caStandard } from './caStandard.js';
import { caSurface } from './caSurface.js';

describe('caStandard', () => {
  test('que after the comparative, com after the equative', () => {
    expect(caStandard(adj(GRAN, { degree: 'more' }), el(np(GOS)))).toBe('que el gos');
    expect(caStandard(adj(GRAN, { degree: 'equally' }), el(np(GOS)))).toBe('com el gos');
  });

  test('a pronoun standard takes its subject form', () => {
    expect(caStandard(adj(GRAN, { degree: 'more' }), el(np(JO)))).toBe('que jo');
  });

  test('a superlative\'s set is de, contracting with the article', () => {
    expect(caSurface(caStandard(adj(GRAN, { degree: 'most', domain: '1' }), el(np(ANIMAL, { number: 'plural' }))))).toBe('dels animals');
  });

  test('nothing without a standard', () => {
    expect(caStandard(adj(GRAN, { degree: 'more' }), undefined)).toBe('');
  });
});
