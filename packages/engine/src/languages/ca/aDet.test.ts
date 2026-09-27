import { describe, expect, test } from 'vitest';
import { CASA, EUROPA, GAT } from './ca.fixtures.js';
import { aDet } from './aDet.js';
import { caSurface } from './caSurface.js';

describe('aDet', () => {
  test('a + the definite article, contracted by caSurface', () => {
    expect(aDet(GAT)).toBe('a el');
    expect(caSurface(`${aDet(GAT)} gat`)).toBe('al gat');
    expect(caSurface(`${aDet(GAT, true)} gats`)).toBe('als gats');
    expect(aDet(CASA)).toBe('a la');
  });

  test('any other determiner rides after a plain a', () => {
    expect(aDet({ ...GAT, definiteness: 'indefinite' })).toBe('a un');
  });

  test('a bare place name takes a alone', () => {
    expect(aDet(EUROPA)).toBe('a');
  });
});
