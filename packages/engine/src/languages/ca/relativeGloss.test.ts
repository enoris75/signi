import { describe, expect, test } from 'vitest';
import { CREADOR, el, ES, FRASE, GAT, LLIBRE, MENJAR, NEN, nounModifier, np, vp } from './ca.fixtures.js';
import { relativeGloss } from './relativeGloss.js';

const eatenByOne = { headRole: 'directObject' as const, subject: el(np(ES)), verbPhrase: vp(MENJAR) };

describe('relativeGloss', () => {
  test('is the relative alone, with no head before it', () => {
    expect(relativeGloss(np(LLIBRE, {}, { relative: eatenByOne }))).toBe('que es menja');
    expect(relativeGloss(np(GAT, {}, { relative: { headRole: 'subject', verbPhrase: vp(MENJAR, { negative: true }) } }))).toBe('que no menja');
  });

  test('agrees with the unspoken head: a plural one is the passive es\'s patient', () => {
    expect(relativeGloss(np(LLIBRE, { number: 'plural' }, { relative: eatenByOne }))).toBe('que es mengen');
  });

  test('drops what belongs to the head', () => {
    expect(relativeGloss(np(CREADOR, {}, { nounModifiers: [nounModifier(FRASE)], possessor: np(NEN), relative: eatenByOne }))).toBe('que es menja');
  });
});
