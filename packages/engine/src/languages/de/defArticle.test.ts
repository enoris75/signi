import { describe, expect, test } from 'vitest';
import { BUCH, KATER, KATZE } from './de.fixtures.js';
import { defArticle } from './defArticle.js';

const CASES = ['nom', 'acc', 'dat', 'gen'] as const;

describe('defArticle', () => {
  test('declines the masculine der', () => {
    expect(CASES.map((c) => defArticle(KATER, c))).toEqual(['der', 'den', 'dem', 'des']);
  });

  test('declines the feminine die', () => {
    expect(CASES.map((c) => defArticle(KATZE, c))).toEqual(['die', 'die', 'der', 'der']);
  });

  test('declines the neuter das', () => {
    expect(CASES.map((c) => defArticle(BUCH, c))).toEqual(['das', 'das', 'dem', 'des']);
  });

  test('the plural is the same for every gender', () => {
    expect(CASES.map((c) => defArticle(KATER, c, true))).toEqual(['die', 'die', 'den', 'der']);
    expect(CASES.map((c) => defArticle(BUCH, c, true))).toEqual(['die', 'die', 'den', 'der']);
  });
});
