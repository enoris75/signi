import { describe, expect, test } from 'vitest';
import { CASA, EUROPA, GAT } from './ca.fixtures.js';
import { caSurface } from './caSurface.js';
import { deDet } from './deDet.js';

describe('deDet', () => {
  test('de + the definite article, contracted by caSurface', () => {
    expect(caSurface(`${deDet(GAT)} gat`)).toBe('del gat');
    expect(caSurface(`${deDet(GAT, true)} gats`)).toBe('dels gats');
    expect(deDet(CASA)).toBe('de la');
  });

  test('any other determiner rides after a plain de, which elides before a vowel', () => {
    expect(caSurface(`${deDet({ ...GAT, definiteness: 'indefinite' })} gat`)).toBe("d'un gat");
  });

  test('a bare place name takes de alone', () => {
    expect(caSurface(`${deDet(EUROPA)} Europa`)).toBe("d'Europa");
  });
});
