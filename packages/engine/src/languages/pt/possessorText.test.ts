import type { PronominalPossessor } from '@signi/shared';
import { describe, expect, test } from 'vitest';
import { possessorText } from './possessorText.js';
import { adj, AFRICA, CAO, COMER, el, GATO, LIVRO, MENINO, np, RAPOSA, RATO, VELHO, vp } from './pt.fixtures.js';

const his: PronominalPossessor = { kind: 'pronominal', person: '3', number: 'singular', gender: 'masc' };

describe('possessorText', () => {
  test('a possessor\'s own possessive follows the fused de + article', () => {
    expect(possessorText(np(LIVRO, {}, { possessor: np(CAO, {}, { possessor: his }) }))).toBe(' do seu cão');
  });

  test('is empty without a possessor', () => {
    expect(possessorText(np(LIVRO))).toBe('');
  });

  test('a pronominal possessor is prenominal, so contributes nothing here', () => {
    expect(possessorText(np(LIVRO, {}, { possessor: his }))).toBe('');
  });

  test('a noun possessor trails as "de" fused with its article', () => {
    expect(possessorText(np(LIVRO, {}, { possessor: np(GATO) }))).toBe(' do gato');
    expect(possessorText(np(LIVRO, {}, { possessor: np(RAPOSA) }))).toBe(' da raposa');
    expect(possessorText(np(LIVRO, {}, { possessor: np(GATO, { number: 'plural' }) }))).toBe(' dos gatos');
    expect(possessorText(np(LIVRO, {}, { possessor: np(AFRICA) }))).toBe(' da África');
  });

  test('the possessor keeps its own determiner, "de" fusing with the article or a demonstrative', () => {
    expect(possessorText(np(LIVRO, {}, { possessor: np(GATO, { definiteness: 'indefinite' }) }))).toBe(' de um gato');
    expect(possessorText(np(LIVRO, {}, { possessor: np(RAPOSA, { definiteness: 'this' }) }))).toBe(' desta raposa');
    expect(possessorText(np(LIVRO, {}, { possessor: np(GATO, { definiteness: 'some', number: 'plural' }) }))).toBe(' de alguns gatos');
  });

  test('the possessor carries its own adjectives, possessor and relative clause', () => {
    expect(possessorText(np(LIVRO, {}, { possessor: np(GATO, {}, { adjectives: [adj(VELHO)] }) }))).toBe(' do gato velho');
    expect(possessorText(np(LIVRO, {}, { possessor: np(CAO, {}, { possessor: np(MENINO) }) }))).toBe(' do cão do menino');
    const eatsTheMouse = { headRole: 'subject' as const, verbPhrase: vp(COMER), directObject: el(np(RATO)) };
    expect(possessorText(np(LIVRO, {}, { possessor: np(GATO, {}, { relative: eatsTheMouse }) }))).toBe(' do gato que come o rato');
  });
});
