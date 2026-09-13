import { describe, expect, test } from 'vitest';
import type { ResolvedNounPhrase } from '../../types.js';
import { adj, ALTO, CALIDAD, el, type Forms, GRANDE, np, TAMANO, TEMPERATURA } from './es.fixtures.js';
import { dimensionGloss } from './dimensionGloss.js';

/** A dimension noun that declares no relation. */
const EDAD: Forms = { base: 'edad', plural: 'edades', gender: 'fem', count: 'singular' };

const gloss = (phrase: ResolvedNounPhrase) => dimensionGloss(phrase, el(phrase));
const bare = (forms: Forms, ...adjectives: Forms[]) =>
  np(forms, { definiteness: 'bare' }, { adjectives: adjectives.map((a) => adj(a)), dimensionGloss: true });

describe('dimensionGloss', () => {
  test('extent and quality take de, the adjective agreeing and following the noun', () => {
    expect(gloss(bare(TAMANO, GRANDE))).toBe('de tamaño grande');
    expect(gloss(bare(CALIDAD, ALTO))).toBe('de calidad alta');
  });

  test('measure takes a', () => {
    expect(gloss(bare(TEMPERATURA, ALTO))).toBe('a temperatura alta');
  });

  test('a noun with no relation is an extent', () => {
    expect(gloss(bare(EDAD))).toBe('de edad');
  });

  test('the noun phrase keeps a chosen determiner and degree', () => {
    expect(gloss(np(TAMANO, { definiteness: 'indefinite' }, { adjectives: [adj(GRANDE)], dimensionGloss: true }))).toBe('de un tamaño grande');
    expect(gloss(np(TAMANO, { definiteness: 'bare' }, { adjectives: [adj(GRANDE, { degree: 'more' })], dimensionGloss: true })))
      .toBe('de tamaño más grande');
  });
});
