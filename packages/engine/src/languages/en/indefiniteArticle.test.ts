import { describe, expect, test } from 'vitest';
import { indefiniteArticle } from './indefiniteArticle.js';

describe('indefiniteArticle', () => {
  test('a vowel letter takes an, a consonant letter a', () => {
    expect(indefiniteArticle('old')).toBe('an');
    expect(indefiniteArticle('unconnected')).toBe('an');
    expect(indefiniteArticle('high')).toBe('a');
    expect(indefiniteArticle('hidden')).toBe('a');
  });

  test('a vowel letter read as a consonant sound takes a', () => {
    expect(indefiniteArticle('universal')).toBe('a');
    expect(indefiniteArticle('unit')).toBe('a');
    expect(indefiniteArticle('useful')).toBe('a');
    expect(indefiniteArticle('European')).toBe('a');
    expect(indefiniteArticle('one')).toBe('a');
  });

  test('the negative un- keeps its vowel sound', () => {
    expect(indefiniteArticle('unimportant')).toBe('an');
    expect(indefiniteArticle('uninteresting')).toBe('an');
  });

  test('a silent h takes an', () => {
    expect(indefiniteArticle('hour')).toBe('an');
    expect(indefiniteArticle('honest')).toBe('an');
    expect(indefiniteArticle('heir')).toBe('an');
  });
});
