import { describe, expect, test } from 'vitest';
import { ES, GAT, JO, MENJAR, NOSALTRES, TORNAR_SE, TU, VOSALTRES } from './ca.fixtures.js';
import { reflexiveClitic } from './reflexiveClitic.js';

describe('reflexiveClitic', () => {
  test('em, et, es, ens, us, es', () => {
    expect(reflexiveClitic(TORNAR_SE, JO)).toBe('em');
    expect(reflexiveClitic(TORNAR_SE, TU)).toBe('et');
    expect(reflexiveClitic(TORNAR_SE, GAT)).toBe('es');
    expect(reflexiveClitic(TORNAR_SE, NOSALTRES)).toBe('ens');
    expect(reflexiveClitic(TORNAR_SE, VOSALTRES)).toBe('us');
    expect(reflexiveClitic(TORNAR_SE, ES)).toBe('es');
  });

  test('nothing for a plain verb', () => {
    expect(reflexiveClitic(MENJAR, GAT)).toBe('');
  });
});
