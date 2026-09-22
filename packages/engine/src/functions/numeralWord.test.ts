import { describe, expect, test } from 'vitest';
import { numeralWord, type CardinalTable } from './numeralWord.js';

const PT: CardinalTable = { 1: { word: 'um', fem: 'uma' }, 2: { word: 'dois', fem: 'duas' }, 3: { word: 'três' } };

describe('numeralWord', () => {
  test('agrees where the language agrees it, and nowhere else', () => {
    expect(numeralWord(PT, 1, false)).toBe('um');
    expect(numeralWord(PT, 1, true)).toBe('uma');
    expect(numeralWord(PT, 2, true)).toBe('duas');
    expect(numeralWord(PT, 3, true)).toBe('três');
  });

  test('a value the table does not spell comes back as its digits', () => {
    expect(numeralWord(PT, 47, false)).toBe('47');
    expect(numeralWord(PT, 47, true)).toBe('47');
  });
});
