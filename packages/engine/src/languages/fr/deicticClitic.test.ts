import { describe, expect, test } from 'vitest';
import { deicticClitic } from './deicticClitic.js';

describe('deicticClitic', () => {
  test('marks the contrast the single "ce" series cannot', () => {
    expect(deicticClitic('this', true)).toBe('-ci');
    expect(deicticClitic('that', true)).toBe('-là');
  });

  test('an uncontrastive demonstrative writes nothing — "ce lieu" points, it does not distinguish', () => {
    expect(deicticClitic('this', false)).toBe('');
    expect(deicticClitic('that', false)).toBe('');
  });

  test('no other determiner takes it, contrastive or not', () => {
    for (const d of ['definite', 'indefinite', 'bare', 'some', 'many', 'few', 'all', 'no']) {
      expect(deicticClitic(d, true)).toBe('');
      expect(deicticClitic(d, false)).toBe('');
    }
  });
});
