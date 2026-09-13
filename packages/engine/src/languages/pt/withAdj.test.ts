import { describe, expect, test } from 'vitest';
import { withAdj } from './withAdj.js';

describe('withAdj', () => {
  test('the bare noun when there are no adjectives', () => {
    expect(withAdj('gato')).toBe('gato');
    expect(withAdj('gato', { pre: '', post: '' })).toBe('gato');
  });

  test('postnominal adjectives follow the noun', () => {
    expect(withAdj('casa', { pre: '', post: 'grande e velha' })).toBe('casa grande e velha');
  });

  test('prenominal adjectives precede it', () => {
    expect(withAdj('vez', { pre: 'primeira', post: '' })).toBe('primeira vez');
  });

  test('both sides at once', () => {
    expect(withAdj('casa', { pre: 'segunda', post: 'maior' })).toBe('segunda casa maior');
  });
});
