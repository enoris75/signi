import { describe, expect, test } from 'vitest';
import { ACQUA, ALA, concept, GATTO, GRANDE, LIBRO, np, PAROLA, TOPO } from './it.fixtures.js';
import { npText } from './npText.js';

describe('npText', () => {
  test('carries the determiner its own forms select', () => {
    expect(npText(np(PAROLA, { definiteness: 'indefinite' }))).toBe('una parola');
    expect(npText(np(PAROLA, { number: 'plural' }))).toBe('le parole');
    expect(npText(np(PAROLA, { definiteness: 'bare', number: 'plural' }))).toBe('parole');
    expect(npText(np(ALA, { definiteness: 'this' }))).toBe("quest'ala");
    expect(npText(np(ACQUA, { definiteness: 'some' }))).toBe("dell'acqua");
    expect(npText(np(TOPO, { definiteness: 'no' }))).toBe('nessun topo');
  });

  test('renders the whole phrase around the noun', () => {
    const phrase = np(LIBRO, { definiteness: 'indefinite' }, { adjectives: [concept(GRANDE, 'BIG')], possessor: np(GATTO) });
    expect(npText(phrase)).toBe('un grande libro del gatto');
  });
});
