import type { PronominalPossessor } from '@signi/shared';
import { describe, expect, test } from 'vitest';
import { adj, CAO, COMER, el, ELE, EU, GATO, GRANDE, group, LIVRO, MENINO, np, RAPOSA, RATO, vp } from './pt.fixtures.js';
import { subjectText } from './subjectText.js';

const his: PronominalPossessor = { kind: 'pronominal', person: '3', number: 'singular', gender: 'masc' };

describe('subjectText', () => {
  test('a noun subject with its determiner and agreeing adjectives', () => {
    expect(subjectText(el(np(GATO, {}, { adjectives: [adj(GRANDE)] })))).toBe('o gato grande');
    expect(subjectText(el(np(RAPOSA, { number: 'plural' }, { adjectives: [adj(GRANDE)] })))).toBe('as raposas grandes');
  });

  test('a pronoun subject is its own surface', () => {
    expect(subjectText(el(np(EU)))).toBe('eu');
  });

  test('each conjunct keeps its own determiner, pronouns included', () => {
    expect(subjectText(el(np(GATO), np(RAPOSA, { definiteness: 'indefinite' })))).toBe('o gato e uma raposa');
    expect(subjectText(el(np(EU), np(ELE)))).toBe('eu e ele');
    expect(subjectText(group('or', np(GATO), np(CAO)))).toBe('o gato ou o cão');
  });

  test('a pronominal possessor replaces the article', () => {
    expect(subjectText(el(np(MENINO), np(CAO, {}, { possessor: his })))).toBe('o menino e o seu cão');
  });

  test('a noun possessor and a relative clause trail the noun', () => {
    expect(subjectText(el(np(LIVRO, {}, { possessor: np(GATO) })))).toBe('o livro do gato');
    const relative = { headRole: 'subject' as const, verbPhrase: vp(COMER), directObject: el(np(RATO)) };
    expect(subjectText(el(np(GATO, {}, { relative })))).toBe('o gato que come o rato');
  });
});
