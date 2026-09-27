import { describe, expect, test } from 'vitest';
import { GAT, GOS, HOME, LLIBRE, np } from './ca.fixtures.js';
import { questionPossessor } from '../../functions/questionPossessor.js';
import { caSurface } from './caSurface.js';
import { possessorText } from './possessorText.js';

const MY = { kind: 'pronominal', person: '1', number: 'singular' } as const;

describe('possessorText', () => {
  test('de + the possessor\'s determiner, contracted or elided', () => {
    expect(caSurface(possessorText(np(LLIBRE, {}, { possessor: np(GAT) })))).toBe(' del gat');
    expect(caSurface(possessorText(np(LLIBRE, {}, { possessor: np(HOME) })))).toBe(" de l'home");
    expect(caSurface(possessorText(np(LLIBRE, {}, { possessor: np(HOME, { definiteness: 'indefinite' }) })))).toBe(" d'un home");
    expect(caSurface(possessorText(np(LLIBRE, {}, { possessor: np(GOS, { number: 'plural' }) })))).toBe(' dels gossos');
  });

  test('a possessor with its own possessive is a whole noun phrase', () => {
    expect(caSurface(possessorText(np(LLIBRE, {}, { possessor: np(GOS, {}, { possessor: MY }) })))).toBe(' del meu gos');
  });

  test('a pronominal possessor says nothing here', () => {
    expect(possessorText(np(LLIBRE, {}, { possessor: MY }))).toBe('');
  });

  test('a possessor question is de qui', () => {
    expect(possessorText(np(LLIBRE, {}, { possessor: questionPossessor() }))).toBe(' de qui');
  });
});
