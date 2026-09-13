import { describe, expect, test } from 'vitest';
import type { ConceptForms, ResolvedNounPhrase } from '../../types.js';
import { dimensionGloss } from './dimensionGloss.js';
import { adj, ALTO, ALTURA, el, type Forms, GRANDE, np, PEQUENO, QUALIDADE, TAMANHO, TEMPERATURA } from './pt.fixtures.js';

// The gloss subject is a bare dimension noun carrying its degree adjective, as the corpus builds it.
const gloss = (forms: Forms, degree: ConceptForms) => np(forms, { definiteness: 'bare' }, { adjectives: [degree], dimensionGloss: true });
const render = (phrase: ResolvedNounPhrase) => dimensionGloss(phrase, el(phrase));

describe('dimensionGloss', () => {
  test('extent and quality take "de", the adjective agreeing and following the noun', () => {
    expect(render(gloss(TAMANHO, adj(GRANDE)))).toBe('de tamanho grande');
    expect(render(gloss(ALTURA, adj(PEQUENO)))).toBe('de altura pequena');
    expect(render(gloss(QUALIDADE, adj(ALTO)))).toBe('de qualidade alta');
  });

  test('measure takes "a"', () => {
    expect(render(gloss(TEMPERATURA, adj(ALTO)))).toBe('a temperatura alta');
  });

  test('the adjective keeps its degree', () => {
    expect(render(gloss(QUALIDADE, adj(ALTO, { degree: 'more' })))).toBe('de qualidade mais alta');
  });
});
