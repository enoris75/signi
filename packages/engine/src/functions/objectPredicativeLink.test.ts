import { describe, expect, test } from 'vitest';
import { objectPredicativeLink } from './objectPredicativeLink.js';

describe('objectPredicativeLink', () => {
  test('reads the word the verb links its factitive predicate with', () => {
    expect(objectPredicativeLink({ base: 'verwandeln', object_predicative_link: 'in' })).toBe('in');
    expect(objectPredicativeLink({ base: 'transform', object_predicative_link: 'into' })).toBe('into');
  });

  test('a verb naming none takes the bare predicate', () => {
    expect(objectPredicativeLink({ base: 'make' })).toBe('');
    expect(objectPredicativeLink()).toBe('');
  });
});
