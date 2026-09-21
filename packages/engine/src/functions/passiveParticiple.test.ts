import { describe, expect, test } from 'vitest';
import { concept } from '../languages/resolved.fixtures.js';
import { passiveParticiple } from './passiveParticiple.js';

describe('passiveParticiple', () => {
  test('the short participle wins where a verb has two (pt salvar: foi salvo)', () => {
    expect(passiveParticiple(concept({ base: 'salvar', participle: 'salvado', participle_passive: 'salvo' })))
      .toBe('salvo');
  });

  test('a verb with one participle spells it', () => {
    expect(passiveParticiple(concept({ base: 'carregar', participle: 'carregado' }))).toBe('carregado');
  });

  test('a verb seeded with none falls back to the citation form rather than to nothing', () => {
    expect(passiveParticiple(concept({ base: 'carregar' }))).toBe('carregar');
  });
});
