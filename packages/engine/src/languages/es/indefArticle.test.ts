import { describe, expect, test } from 'vitest';
import { AGUA, CASA, GATO } from './es.fixtures.js';
import { indefArticle } from './indefArticle.js';

describe('indefArticle', () => {
  test('un / una in the singular', () => {
    expect(indefArticle(GATO)).toBe('un');
    expect(indefArticle(CASA)).toBe('una');
  });

  test('unos / unas in the plural', () => {
    expect(indefArticle(GATO, true)).toBe('unos');
    expect(indefArticle(CASA, true)).toBe('unas');
  });

  test('a stressed-a feminine takes un in the singular only', () => {
    expect(indefArticle(AGUA)).toBe('un');
    expect(indefArticle(AGUA, true)).toBe('unas');
  });

  test('defaults to the masculine without a gender', () => {
    expect(indefArticle({ base: 'slot' })).toBe('un');
  });
});
