import type { PronominalPossessor } from '@signi/shared';
import { questionPossessor } from '../../functions/questionPossessor.js';
import { describe, expect, test } from 'vitest';
import { possessorText } from './possessorText.js';
import { adj, AFRICA, CAO, COMER, el, GATO, LIVRO, MENINO, np, RAPOSA, RATO, VELHO, vp } from './pt.fixtures.js';

const his: PronominalPossessor = { kind: 'pronominal', person: '3', number: 'singular', gender: 'masc' };

describe('possessorText', () => {
  test('a possessor\'s own possessive follows the fused de + article', () => {
    expect(possessorText(np(LIVRO, {}, { possessor: np(CAO, {}, { possessor: his }) }))).toBe(' do seu cão');
  });

  // A234: a demonstrative or a quantifier keeps its slot, fused with "de", and the possessive follows the
  // noun without its article, as in the object (A187).
  test('a possessor\'s own demonstrative or quantifier stays, and the possessive follows the noun', () => {
    const my: PronominalPossessor = { kind: 'pronominal', person: '1', number: 'singular' };
    expect(possessorText(np(LIVRO, {}, { possessor: np(RAPOSA, { definiteness: 'this' }, { possessor: my }) }))).toBe(' desta raposa minha');
    expect(possessorText(np(LIVRO, {}, { possessor: np(GATO, { definiteness: 'no' }, { possessor: his }) }))).toBe(' de nenhum gato seu');
    expect(possessorText(np(LIVRO, {}, { possessor: np(GATO, { definiteness: 'some', number: 'plural' }, { possessor: his }) }))).toBe(' de alguns gatos seus');
    // The indefinite keeps its slot too since A277 (it was " do seu gato").
    expect(possessorText(np(LIVRO, {}, { possessor: np(GATO, { definiteness: 'indefinite' }, { possessor: his }) }))).toBe(' de um gato seu');
    expect(possessorText(np(LIVRO, {}, { possessor: np(GATO, { definiteness: 'bare' }, { possessor: his }) }))).toBe(' do seu gato');
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

  // A339: at one beside a definite or demonstrative the cardinal is left out (A319).
  test('a possessor counted by one beside a definite or demonstrative is the singular', () => {
    expect(possessorText(np(LIVRO, {}, { possessor: np(GATO, { numeral: '1' }) }))).toBe(' do gato');
    expect(possessorText(np(LIVRO, {}, { possessor: np(RAPOSA, { numeral: '1', definiteness: 'this' }) }))).toBe(' desta raposa');
    expect(possessorText(np(LIVRO, {}, { possessor: np(GATO, { numeral: '2', number: 'plural' }) }))).toBe(' dos dois gatos');
  });

  test('the possessor carries its own adjectives, possessor and relative clause', () => {
    expect(possessorText(np(LIVRO, {}, { possessor: np(GATO, {}, { adjectives: [adj(VELHO)] }) }))).toBe(' do gato velho');
    expect(possessorText(np(LIVRO, {}, { possessor: np(CAO, {}, { possessor: np(MENINO) }) }))).toBe(' do cão do menino');
    const eatsTheMouse = { headRole: 'subject' as const, verbPhrase: vp(COMER), directObject: el(np(RATO)) };
    expect(possessorText(np(LIVRO, {}, { possessor: np(GATO, {}, { relative: eatsTheMouse }) }))).toBe(' do gato que come o rato');
  });
});

describe('possessorText: the possessor question (P09-E14)', () => {
  test('the stand-in is de quem, never fused', () => {
    expect(possessorText(np(LIVRO, {}, { possessor: questionPossessor() }))).toBe(' de quem');
  });
});
