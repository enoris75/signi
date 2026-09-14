import { describe, expect, test } from 'vitest';
import { adj, np } from '../languages/resolved.fixtures.js';
import { withDefiniteness } from './withDefiniteness.js';

const BOOK = { base: 'book', count: 'singular' };

describe('withDefiniteness', () => {
  // A35: a `no` object re-rendered under a non-negative determiner when the clause is negated elsewhere.
  test("overrides the head's definiteness and keeps its other forms", () => {
    const noBook = np(BOOK, { definiteness: 'no' });
    expect(withDefiniteness(noBook, 'indefinite').head.forms).toEqual({ ...BOOK, definiteness: 'indefinite' });
  });

  test('leaves the original phrase untouched, sharing the rest of it', () => {
    const noBook = np(BOOK, { definiteness: 'no' }, { adjectives: [adj({ base: 'red' })] });
    const anyBook = withDefiniteness(noBook, 'indefinite');
    expect(noBook.head.forms['definiteness']).toBe('no');
    expect(anyBook.adjectives).toBe(noBook.adjectives);
    expect(anyBook.head.conceptId).toBe(noBook.head.conceptId);
  });
});
