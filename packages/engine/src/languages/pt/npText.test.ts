import type { PronominalPossessor } from '@signi/shared';
import { describe, expect, test } from 'vitest';
import { npText } from './npText.js';
import { adj, BELO, CASA, COMER, concept, el, GATO, GRANDE, LIVRO, np, PALAVRA, PRIMEIRO, RATO, VELHO, vp } from './pt.fixtures.js';

const my: PronominalPossessor = { kind: 'pronominal', person: '1', number: 'singular' };

describe('npText', () => {
  test('a noun phrase carrying its own determiner', () => {
    expect(npText(np(PALAVRA, { definiteness: 'indefinite' }))).toBe('uma palavra');
    expect(npText(np(RATO, { number: 'plural' }))).toBe('os ratos');
  });

  test('the adjectives agree with the head and follow it', () => {
    expect(npText(np(CASA, { definiteness: 'indefinite' }, { adjectives: [adj(VELHO)] }))).toBe('uma casa velha');
    expect(npText(np(CASA, { number: 'plural' }, { adjectives: [adj(GRANDE), adj(VELHO), adj(BELO)] }))).toBe('as casas grandes, velhas e belas');
  });

  test('an ordinal precedes the noun', () => {
    expect(npText(np(CASA, {}, { adjectives: [concept(PRIMEIRO, 'FIRST'), adj(VELHO)] }))).toBe('a primeira casa velha');
  });

  test('a pronominal possessor replaces the determiner', () => {
    expect(npText(np(LIVRO, { definiteness: 'bare', number: 'plural' }, { possessor: my }))).toBe('os meus livros');
    // The indefinite keeps its article and the possessive follows the noun (A277).
    expect(npText(np(LIVRO, { definiteness: 'indefinite', number: 'plural' }, { possessor: my }))).toBe('uns livros meus');
  });

  test('a noun possessor and a relative clause trail the noun', () => {
    expect(npText(np(LIVRO, {}, { possessor: np(GATO) }))).toBe('o livro do gato');
    expect(npText(np(RATO, {}, { relative: { headRole: 'directObject', subject: el(np(GATO)), verbPhrase: vp(COMER, { tense: 'past' }) } })))
      .toBe('o rato que o gato comeu');
  });
});
