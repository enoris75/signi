import { describe, expect, test } from 'vitest';
import { GAT, JO, NOSALTRES } from './ca.fixtures.js';
import { subjectPhrase } from './subjectPhrase.js';

describe('subjectPhrase', () => {
  test('a pronoun is its own form', () => {
    expect(subjectPhrase(JO)).toBe('jo');
    expect(subjectPhrase(NOSALTRES)).toBe('nosaltres');
  });

  test('a noun takes its determiner', () => {
    expect(subjectPhrase(GAT)).toBe('el gat');
  });
});
