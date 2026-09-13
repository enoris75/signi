import { describe, expect, test } from 'vitest';
import { withAdj } from './withAdj.js';

describe('withAdj', () => {
  test('a noun without adjectives stands alone', () => {
    expect(withAdj('gato')).toBe('gato');
    expect(withAdj('gato', { pre: '', post: '' })).toBe('gato');
  });

  test('postnominal adjectives follow the noun', () => {
    expect(withAdj('casa', { pre: '', post: 'vieja y hermosa' })).toBe('casa vieja y hermosa');
  });

  test('prenominal adjectives precede it', () => {
    expect(withAdj('día', { pre: 'primer', post: '' })).toBe('primer día');
  });

  test('both sides at once', () => {
    expect(withAdj('gato', { pre: 'tercer', post: 'grande' })).toBe('tercer gato grande');
  });
});
