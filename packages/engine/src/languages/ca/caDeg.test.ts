import { describe, expect, test } from 'vitest';
import { adj, BO, GRAN } from './ca.fixtures.js';
import { caDeg } from './caDeg.js';

describe('caDeg', () => {
  test('the degree adverb before the agreed adjective', () => {
    expect(caDeg(adj(GRAN, { degree: 'more' }), 'gran')).toBe('més gran');
    expect(caDeg(adj(GRAN, { degree: 'less' }), 'gran')).toBe('menys gran');
    expect(caDeg(adj(GRAN, { degree: 'equally' }), 'gran')).toBe('igual de gran');
    expect(caDeg(adj(GRAN), 'gran')).toBe('gran');
  });

  test('bo compares suppletively, agreeing only in number', () => {
    expect(caDeg(adj(BO, { degree: 'more' }), 'bo')).toBe('millor');
    expect(caDeg(adj(BO, { degree: 'most' }), 'bones', true)).toBe('millors');
    expect(caDeg(adj(BO, { degree: 'less' }), 'bo')).toBe('menys bo');
  });
});
