import { describe, expect, test } from 'vitest';
import { AFRICA, CASA, JAPAO, PORTUGAL } from './pt.fixtures.js';
import { isBareName } from './isBareName.js';

describe('isBareName', () => {
  test('a proper noun marked article-less', () => {
    expect(isBareName(PORTUGAL)).toBe(true);
  });

  test('any other proper noun takes its article', () => {
    expect(isBareName(AFRICA)).toBe(false);
    expect(isBareName(JAPAO)).toBe(false);
  });

  test('the flag means nothing on a common noun', () => {
    expect(isBareName({ ...CASA, takes_article: '0' })).toBe(false);
  });
});
