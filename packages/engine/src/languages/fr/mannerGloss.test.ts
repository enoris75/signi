import { describe, expect, test } from 'vitest';
import { BON, concept, el, GRAND, LUMIERE, MANIERE, np, RENARD, SOIN, VITESSE } from './fr.fixtures.js';
import { mannerGloss } from './mannerGloss.js';

describe('mannerGloss', () => {
  test('wraps the manner noun phrase in the adposition its relation selects', () => {
    expect(mannerGloss(el(np(VITESSE, { definiteness: 'bare' }, { adjectives: [concept(GRAND, 'BIG')], mannerGloss: true })))).toBe('à grande vitesse');
    expect(mannerGloss(el(np(SOIN, { definiteness: 'bare' }, { mannerGloss: true })))).toBe('avec soin');
    expect(mannerGloss(el(np(RENARD, {}, { mannerGloss: true })))).toBe('comme le renard');
  });

  test('keeps its determiner, contracting or eliding the adposition against it', () => {
    expect(mannerGloss(el(np(MANIERE, { definiteness: 'indefinite' }, { adjectives: [concept(BON, 'GOOD')], mannerGloss: true }))))
      .toBe("d'une bonne manière");
    expect(mannerGloss(el(np(MANIERE, { definiteness: 'this' }, { mannerGloss: true })))).toBe('de cette manière');
    expect(mannerGloss(el(np(VITESSE, {}, { possessor: np(LUMIERE), mannerGloss: true })))).toBe('à la vitesse de la lumière');
  });

  test('each conjunct takes its own adposition', () => {
    const slot = el(np(SOIN, { definiteness: 'bare' }), np(VITESSE, { definiteness: 'bare' }, { adjectives: [concept(GRAND, 'BIG')] }));
    expect(mannerGloss(slot)).toBe('avec soin et à grande vitesse');
  });
});
