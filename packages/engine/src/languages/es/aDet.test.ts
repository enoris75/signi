import { describe, expect, test } from 'vitest';
import { AFRICA, AGUA, ANTARTIDA, CASA, GATO, NINO } from './es.fixtures.js';
import { aDet } from './aDet.js';

describe('aDet', () => {
  test('a definite phrase contracts a + el to al', () => {
    expect(aDet(GATO)).toBe('al');
    expect(aDet({ ...GATO, definiteness: 'definite' })).toBe('al');
    expect(aDet(AGUA)).toBe('al');
  });

  test('the other definite articles stay apart', () => {
    expect(aDet(CASA)).toBe('a la');
    expect(aDet(GATO, true)).toBe('a los');
  });

  test('any other determiner follows plain a', () => {
    expect(aDet({ ...GATO, definiteness: 'indefinite' })).toBe('a un');
    expect(aDet({ ...CASA, definiteness: 'that' })).toBe('a esa');
    expect(aDet({ ...NINO, definiteness: 'all' }, true)).toBe('a todos los');
    expect(aDet({ ...AGUA, definiteness: 'all' })).toBe('a toda el');
    expect(aDet({ ...CASA, definiteness: 'bare' })).toBe('a');
  });

  test('a proper name goes bare unless it is inherently articled', () => {
    expect(aDet(AFRICA)).toBe('a');
    expect(aDet({ ...AFRICA, definiteness: 'this' })).toBe('a');
    expect(aDet(ANTARTIDA)).toBe('a la');
  });
});
