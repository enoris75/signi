import { describe, expect, test } from 'vitest';
import { adj, ALTO, BUONO, concept, DIMENSIONE, el, type Forms, GRANDE, np, QUALITA, TEMPERATURA, VELOCITA } from './it.fixtures.js';
import { dimensionGloss } from './dimensionGloss.js';
import type { ConceptForms } from '../../types.js';

/** The gloss over a bare dimension noun carrying its degree adjective. */
const gloss = (noun: Forms, ...adjectives: ConceptForms[]) => {
  const phrase = np(noun, { definiteness: 'bare' }, { adjectives, dimensionGloss: true });
  return dimensionGloss(phrase, el(phrase));
};

describe('dimensionGloss', () => {
  test('an extent or quality noun is di + the bare noun phrase', () => {
    expect(gloss(DIMENSIONE, concept(GRANDE, 'GREAT'))).toBe('di grande dimensione');
    expect(gloss(QUALITA, concept(BUONO, 'GOOD'))).toBe('di buona qualità');
  });

  test('a measure noun is a', () => {
    expect(gloss(TEMPERATURA, adj(ALTO))).toBe('a temperatura alta');
  });

  test('a noun that declares no relation falls back to extent', () => {
    expect(gloss(VELOCITA)).toBe('di velocità');
  });
});
