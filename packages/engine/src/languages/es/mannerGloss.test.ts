import { describe, expect, test } from 'vitest';
import { adj, ALTO, BUENO, CUIDADO, el, GATO, LUZ, MANERA, np, VELOCIDAD } from './es.fixtures.js';
import { mannerGloss } from './mannerGloss.js';

describe('mannerGloss', () => {
  test('a measure noun takes a, fused with a definite article', () => {
    expect(mannerGloss(el(np(VELOCIDAD, { definiteness: 'bare' }, { adjectives: [adj(ALTO)], mannerGloss: true })))).toBe('a velocidad alta');
    expect(mannerGloss(el(np(VELOCIDAD, {}, { possessor: np(LUZ), mannerGloss: true })))).toBe('a la velocidad de la luz');
  });

  test('a mode noun takes de and keeps its determiner', () => {
    expect(mannerGloss(el(np(MANERA, { definiteness: 'indefinite' }, { adjectives: [adj(BUENO)], mannerGloss: true })))).toBe('de una manera buena');
    expect(mannerGloss(el(np(MANERA, { definiteness: 'this' }, { mannerGloss: true })))).toBe('de esta manera');
    expect(mannerGloss(el(np(MANERA, { number: 'plural', definiteness: 'many' }, { mannerGloss: true })))).toBe('de muchas maneras');
  });

  test('a means noun takes con, and any other noun como', () => {
    expect(mannerGloss(el(np(CUIDADO, { definiteness: 'bare' }, { mannerGloss: true })))).toBe('con cuidado');
    expect(mannerGloss(el(np(GATO, { definiteness: 'indefinite' }, { mannerGloss: true })))).toBe('como un gato');
  });

  test('coordinated manner nouns each take their own adposition', () => {
    const fast = np(VELOCIDAD, { definiteness: 'bare' }, { adjectives: [adj(ALTO)] });
    expect(mannerGloss(el(fast, np(CUIDADO, { definiteness: 'bare' })))).toBe('a velocidad alta y con cuidado');
  });
});
