import { describe, expect, test } from 'vitest';
import { ptNegateInfinitive } from './ptNegateInfinitive.js';

describe('ptNegateInfinitive', () => {
  test('prefixes "não" to a plain infinitive', () => {
    expect(ptNegateInfinitive('comer')).toBe('não comer');
    expect(ptNegateInfinitive('correr')).toBe('não correr');
  });

  test('draws a reflexive infinitive’s "-se" ahead of the verb (A233)', () => {
    expect(ptNegateInfinitive('mover-se')).toBe('não se mover');
    expect(ptNegateInfinitive('tornar-se')).toBe('não se tornar');
  });

  test('a passive citation keeps its shape', () => {
    expect(ptNegateInfinitive('ser comida')).toBe('não ser comida');
  });
});
