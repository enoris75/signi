import { describe, expect, test } from 'vitest';
import { agreeAdj } from './agreeAdj.js';

describe('agreeAdj', () => {
  test('an -o adjective inflects for gender and number', () => {
    expect(agreeAdj('viejo', 'masc', false)).toBe('viejo');
    expect(agreeAdj('viejo', 'fem', false)).toBe('vieja');
    expect(agreeAdj('viejo', 'masc', true)).toBe('viejos');
    expect(agreeAdj('viejo', 'fem', true)).toBe('viejas');
  });

  test('keeps a written accent through the ending', () => {
    expect(agreeAdj('frío', 'fem', true)).toBe('frías');
  });

  test('an -e adjective only pluralises', () => {
    expect(agreeAdj('grande', 'fem', false)).toBe('grande');
    expect(agreeAdj('triste', 'fem', true)).toBe('tristes');
  });

  test('a consonant-final adjective only pluralises', () => {
    expect(agreeAdj('feliz', 'fem', false)).toBe('feliz');
    expect(agreeAdj('feliz', 'fem', true)).toBe('felices');
    expect(agreeAdj('débil', 'masc', true)).toBe('débiles');
  });

  test('a neuter referent agrees as the masculine', () => {
    expect(agreeAdj('cansado', 'neut', false)).toBe('cansado');
  });

  test('an empty base stays empty', () => {
    expect(agreeAdj('', 'fem', true)).toBe('');
  });

  test('an invariable adjective keeps its base in every gender and number', () => {
    expect(agreeAdj('cero', 'fem', false)).toBe('cero');
    expect(agreeAdj('cero', 'masc', true)).toBe('cero');
    expect(agreeAdj('cero', 'fem', true)).toBe('cero');
  });
});
