import { describe, expect, test } from 'vitest';
import { esCliticize } from './esCliticize.js';

describe('esCliticize', () => {
  test('is a no-op without a clitic', () => {
    expect(esCliticize('', 've')).toBe('ve');
    expect(esCliticize('', 'no ve')).toBe('no ve');
  });

  test('puts the clitic before the finite verb', () => {
    expect(esCliticize('me', 've')).toBe('me ve');
    expect(esCliticize('la', 'ha visto')).toBe('la ha visto');
    expect(esCliticize('se lo', 'come')).toBe('se lo come');
  });

  test('slots the clitic in after a leading no', () => {
    expect(esCliticize('me', 'no ve')).toBe('no me ve');
    expect(esCliticize('lo', 'no puede comer')).toBe('no lo puede comer');
  });

  test('only a whole-word no counts as negation', () => {
    expect(esCliticize('lo', 'nota')).toBe('lo nota');
  });
});
