import { describe, expect, test } from 'vitest';
import { AGE, BAS, BON, concept, el, GRAND, HAUTEUR, np, PETIT, QUALITE, TAILLE, VITESSE } from './fr.fixtures.js';
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

  test('de elides before a vowel-initial noun that leads the phrase', () => {
    expect(gloss(np(AGE, { definiteness: 'bare' }, { adjectives: [concept(BAS, 'LOW')], dimensionGloss: true }))).toBe("d'âge bas");
    expect(gloss(np(AGE, { definiteness: 'bare' }, { dimensionGloss: true }))).toBe("d'âge");
  });

  test('de stays whole when a prenominal adjective leads', () => {
    expect(gloss(np(AGE, { definiteness: 'bare' }, { adjectives: [concept(PETIT, 'SMALL')], dimensionGloss: true }))).toBe('de petit âge');
  });

  test('an h muet noun elides; an h aspiré noun does not', () => {
    const humidite = { base: 'humidité', gender: 'fem', count: 'singular', elides: '1', dimensionRelation: 'extent' };
    expect(gloss(np(humidite, { definiteness: 'bare' }, { dimensionGloss: true }))).toBe("d'humidité");
    expect(gloss(np(HAUTEUR, { definiteness: 'bare' }, { adjectives: [concept(BAS, 'LOW')], dimensionGloss: true }))).toBe('de hauteur basse');
  });

  test('à never elides', () => {
    const age = np({ ...AGE, dimensionRelation: 'measure' }, { definiteness: 'bare' }, { adjectives: [concept(BAS, 'LOW')], dimensionGloss: true });
    expect(gloss(age)).toBe('à âge bas');
  });

  test('a noun declaring no relation is an extent', () => {
    const { dimensionRelation: _, ...size } = TAILLE;
    expect(gloss(np(size, { definiteness: 'bare' }, { adjectives: [concept(PETIT, 'SMALL')], dimensionGloss: true }))).toBe('de petite taille');
  });
});
