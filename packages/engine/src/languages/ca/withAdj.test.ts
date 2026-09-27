import { describe, expect, test } from 'vitest';
import { withAdj } from './withAdj.js';

describe('withAdj', () => {
  test('sets the adjectives around the noun', () => {
    expect(withAdj('gat', { pre: 'altre', post: 'negre' })).toBe('altre gat negre');
    expect(withAdj('gat')).toBe('gat');
  });
});
