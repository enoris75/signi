import { describe, expect, test } from 'vitest';
import { adj, ALTO, BUONO, concept, CURA, el, GRANDE, LUCE, MODO, np, VELOCITA, VOLPE } from './it.fixtures.js';
import { mannerGloss } from './mannerGloss.js';

const GOOD = concept(BUONO, 'GOOD');

describe('mannerGloss', () => {
  test('the manner relation of the noun picks the preposition', () => {
    expect(mannerGloss(el(np(VELOCITA, { definiteness: 'bare' }, { adjectives: [adj(ALTO)] })))).toBe('a velocità alta');
    expect(mannerGloss(el(np(MODO, { definiteness: 'indefinite' }, { adjectives: [GOOD] })))).toBe('in un buon modo');
    expect(mannerGloss(el(np(CURA, { definiteness: 'bare' }, { adjectives: [concept(GRANDE, 'BIG')] })))).toBe('con grande cura');
    expect(mannerGloss(el(np(VOLPE)))).toBe('come la volpe');
  });

  test('the preposition fuses with a definite article', () => {
    expect(mannerGloss(el(np(VELOCITA, {}, { possessor: np(LUCE) })))).toBe('alla velocità della luce');
  });

  test('any other determiner stays apart from it', () => {
    expect(mannerGloss(el(np(MODO, { definiteness: 'this' })))).toBe('in questo modo');
    expect(mannerGloss(el(np(MODO, { definiteness: 'no' })))).toBe('in nessun modo');
    expect(mannerGloss(el(np(MODO, { definiteness: 'all', number: 'plural' })))).toBe('in tutti i modi');
  });

  test('each coordinated conjunct takes its own preposition', () => {
    const slot = el(np(CURA, { definiteness: 'bare' }), np(VELOCITA, { definiteness: 'bare' }, { adjectives: [adj(ALTO)] }));
    expect(mannerGloss(slot)).toBe('con cura e a velocità alta');
  });
});
