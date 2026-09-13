import { describe, expect, test } from 'vitest';
import { AFRICA, AGUA, ANTARTIDA, CASA, GATO, MANERA } from './es.fixtures.js';
import { deDet } from './deDet.js';

describe('deDet', () => {
  test('a definite phrase contracts de + el to del', () => {
    expect(deDet(GATO)).toBe('del');
    expect(deDet({ ...AGUA, definiteness: 'definite' })).toBe('del');
  });

  test('the other definite articles stay apart', () => {
    expect(deDet(CASA)).toBe('de la');
    expect(deDet(CASA, true)).toBe('de las');
  });

  test('any other determiner follows plain de', () => {
    expect(deDet({ ...GATO, definiteness: 'indefinite' })).toBe('de un');
    expect(deDet({ ...MANERA, definiteness: 'indefinite' })).toBe('de una');
    expect(deDet({ ...GATO, definiteness: 'some' }, true)).toBe('de algunos');
    expect(deDet({ ...MANERA, definiteness: 'bare' })).toBe('de');
  });

  test('a proper name goes bare unless it is inherently articled', () => {
    expect(deDet(AFRICA)).toBe('de');
    expect(deDet(ANTARTIDA)).toBe('de la');
  });
});
