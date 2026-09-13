import { describe, expect, test } from 'vitest';
import { adj, CANSADO, FORTE, VELHO } from './pt.fixtures.js';
import { ptDeg } from './ptDeg.js';

describe('ptDeg', () => {
  test('leaves a positive adjective as it is', () => {
    expect(ptDeg(adj(VELHO), 'velha')).toBe('velha');
  });

  test('comparative and relative superlative share "mais" before the agreed surface', () => {
    expect(ptDeg(adj(VELHO, { degree: 'more' }), 'velho')).toBe('mais velho');
    expect(ptDeg(adj(VELHO, { degree: 'most' }), 'velhas')).toBe('mais velhas');
  });

  test('the lowered degrees share "menos"', () => {
    expect(ptDeg(adj(CANSADO, { degree: 'less' }), 'cansada')).toBe('menos cansada');
    expect(ptDeg(adj(CANSADO, { degree: 'least' }), 'cansados')).toBe('menos cansados');
  });

  test('equality takes the invariant "igualmente"', () => {
    expect(ptDeg(adj(FORTE, { degree: 'equally' }), 'fortes')).toBe('igualmente fortes');
  });

  test('an empty surface stays empty rather than leaving a bare degree word', () => {
    expect(ptDeg(adj(FORTE, { degree: 'more' }), '')).toBe('');
  });
});
