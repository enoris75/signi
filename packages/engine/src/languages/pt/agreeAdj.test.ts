import { describe, expect, test } from 'vitest';
import { agreeAdj } from './agreeAdj.js';

describe('agreeAdj', () => {
  test('an -o adjective inflects -o / -a / -os / -as', () => {
    expect(agreeAdj('pequeno', 'masc', false)).toBe('pequeno');
    expect(agreeAdj('pequeno', 'fem', false)).toBe('pequena');
    expect(agreeAdj('pequeno', 'masc', true)).toBe('pequenos');
    expect(agreeAdj('pequeno', 'fem', true)).toBe('pequenas');
  });

  test('an -e or consonant-final adjective only pluralises', () => {
    expect(agreeAdj('grande', 'fem', false)).toBe('grande');
    expect(agreeAdj('forte', 'fem', true)).toBe('fortes');
    expect(agreeAdj('feliz', 'fem', true)).toBe('felizes');
    expect(agreeAdj('jovem', 'masc', true)).toBe('jovens');
    expect(agreeAdj('universal', 'fem', true)).toBe('universais');
  });

  test('bom and mau are irregular', () => {
    expect(agreeAdj('bom', 'fem', false)).toBe('boa');
    expect(agreeAdj('bom', 'masc', true)).toBe('bons');
    expect(agreeAdj('mau', 'fem', false)).toBe('má');
    expect(agreeAdj('mau', 'fem', true)).toBe('más');
  });

  test('agrees the last word of a multi-word adjective', () => {
    expect(agreeAdj('não conectado', 'fem', true)).toBe('não conectadas');
  });

  test('an empty base gives an empty surface', () => {
    expect(agreeAdj('', 'fem', true)).toBe('');
  });
});
