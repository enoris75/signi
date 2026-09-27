import { describe, expect, test } from 'vitest';
import { AMI, CHASA, GIAT, UM } from './rumgr.fixtures.js';
import { indefArticle } from './indefArticle.js';

describe('indefArticle', () => {
  test('in (m), ina (f)', () => {
    expect(indefArticle(GIAT, false)).toBe('in');
    expect(indefArticle(CHASA, false)).toBe('ina');
  });

  test('never elided before a vowel', () => {
    expect(indefArticle(UM, false)).toBe('in');
    expect(indefArticle({ ...AMI, gender: 'fem', base: 'amia' }, false)).toBe('ina');
  });

  test('the plural is bare', () => {
    expect(indefArticle(GIAT, true)).toBe('');
    expect(indefArticle(CHASA, true)).toBe('');
  });

  test('defaults to the masculine', () => {
    expect(indefArticle({ base: 'cudesch' }, false)).toBe('in');
  });
});
