import { describe, expect, test } from 'vitest';
import { BON, concept, el, GRAND, np, PETIT, QUALITE, TAILLE, VITESSE } from './fr.fixtures.js';
import { dimensionGloss } from './dimensionGloss.js';

const gloss = (phrase: ReturnType<typeof np>) => dimensionGloss(phrase, el(phrase));

describe('dimensionGloss', () => {
  test('an extent or quality noun takes de', () => {
    expect(gloss(np(TAILLE, { definiteness: 'bare' }, { adjectives: [concept(PETIT, 'SMALL')], dimensionGloss: true }))).toBe('de petite taille');
    expect(gloss(np(QUALITE, { definiteness: 'bare' }, { adjectives: [concept(BON, 'GOOD')], dimensionGloss: true }))).toBe('de bonne qualité');
  });

  test('a measure noun takes à', () => {
    const speed = np({ ...VITESSE, dimensionRelation: 'measure' }, { definiteness: 'bare' }, { adjectives: [concept(GRAND, 'BIG')], dimensionGloss: true });
    expect(gloss(speed)).toBe('à grande vitesse');
  });

  test('a noun declaring no relation is an extent', () => {
    const { dimensionRelation: _, ...size } = TAILLE;
    expect(gloss(np(size, { definiteness: 'bare' }, { adjectives: [concept(PETIT, 'SMALL')], dimensionGloss: true }))).toBe('de petite taille');
  });
});
