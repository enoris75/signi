import { describe, expect, test } from 'vitest';
import { mannerGloss } from './mannerGloss.js';
import { adj, ALTO, BOM, concept, CUIDADO, el, LUZ, MANEIRA, np, RAPOSA, VELOCIDADE } from './pt.fixtures.js';

describe('mannerGloss', () => {
  test('a measure noun takes "a", fused with a definite article', () => {
    expect(mannerGloss(el(np(VELOCIDADE, { definiteness: 'bare' }, { adjectives: [adj(ALTO)], mannerGloss: true })))).toBe('a velocidade alta');
    expect(mannerGloss(el(np(VELOCIDADE, {}, { possessor: np(LUZ), mannerGloss: true })))).toBe('à velocidade da luz');
  });

  test('a mode noun takes "de" and keeps its own determiner', () => {
    const goodWay = np(MANEIRA, { definiteness: 'indefinite' }, { adjectives: [concept(BOM, 'GOOD')], mannerGloss: true });
    expect(mannerGloss(el(goodWay))).toBe('de uma maneira boa');
    expect(mannerGloss(el(np(MANEIRA, { definiteness: 'many', number: 'plural' }, { mannerGloss: true })))).toBe('de muitas maneiras');
  });

  test('a means noun takes "com", a similative "como"', () => {
    expect(mannerGloss(el(np(CUIDADO, { definiteness: 'bare' }, { mannerGloss: true })))).toBe('com cuidado');
    expect(mannerGloss(el(np(RAPOSA, {}, { mannerGloss: true })))).toBe('como a raposa');
  });

  test('coordinated conjuncts each take their own preposition', () => {
    const care = np(CUIDADO, { definiteness: 'bare' });
    const highSpeed = np(VELOCIDADE, { definiteness: 'bare' }, { adjectives: [adj(ALTO)] });
    expect(mannerGloss(el(care, highSpeed))).toBe('com cuidado e a velocidade alta');
  });
});
