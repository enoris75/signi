import { describe, expect, test } from 'vitest';
import { liftPreposition } from './liftPreposition.js';

describe('liftPreposition', () => {
  test('takes the preposition off the front, keeping the article', () => {
    expect(liftPreposition('tra la casa', 'tra')).toBe('la casa');
    expect(liftPreposition('zwischen dem Haus', 'zwischen')).toBe('dem Haus');
  });

  test('a bare noun is left with no leading space', () => {
    expect(liftPreposition('entre casas', 'entre')).toBe('casas');
  });

  test('a word that only begins with the same letters is not the preposition', () => {
    expect(liftPreposition('entrecôte', 'entre')).toBe('entrecôte');
  });

  test('a conjunct with a preposition of its own, or an empty one to lift, is left alone', () => {
    expect(liftPreposition('a casa', 'tra')).toBe('a casa');
    expect(liftPreposition('la casa', '')).toBe('la casa');
  });
});
