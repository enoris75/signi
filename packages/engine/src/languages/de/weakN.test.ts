import { describe, expect, test } from 'vitest';
import { weakN } from './weakN.js';

describe('weakN', () => {
  test('leaves the nominative singular alone', () => {
    expect(weakN('Junge', 'nom', false)).toBe('Junge');
  });

  test('adds a bare -n after a final -e in every oblique case', () => {
    expect(weakN('Junge', 'acc', false)).toBe('Jungen');
    expect(weakN('Junge', 'dat', false)).toBe('Jungen');
    expect(weakN('Junge', 'gen', false)).toBe('Jungen');
  });

  test('adds -en after a consonant', () => {
    expect(weakN('Mensch', 'acc', false)).toBe('Menschen');
    expect(weakN('Student', 'dat', false)).toBe('Studenten');
  });

  test('leaves the plural and an empty word alone', () => {
    expect(weakN('Jungen', 'dat', true)).toBe('Jungen');
    expect(weakN('', 'acc', false)).toBe('');
  });
});
