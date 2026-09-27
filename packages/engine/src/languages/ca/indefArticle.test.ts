import { describe, expect, test } from 'vitest';
import { CASA, GAT } from './ca.fixtures.js';
import { indefArticle } from './indefArticle.js';

describe('indefArticle', () => {
  test('un / una, and in the plural uns / unes', () => {
    expect(indefArticle(GAT)).toBe('un');
    expect(indefArticle(CASA)).toBe('una');
    expect(indefArticle(GAT, true)).toBe('uns');
    expect(indefArticle(CASA, true)).toBe('unes');
  });
});
