import { describe, expect, test } from 'vitest';
import type { PronominalPossessor } from '@signi/shared';
import { AUTER, BARTGA, CHASA, CHAUN, DUNNA, GIAT, GROND, NAIR, UM, VELA, adj, concept, nounModifier, np } from './rumgr.fixtures.js';
import { npText } from './npText.js';

const MY: PronominalPossessor = { kind: 'pronominal', person: '1', number: 'singular' };
const THEIR: PronominalPossessor = { kind: 'pronominal', person: '3', number: 'plural' };

describe('renderNP (through npText)', () => {
  test('article, prenominal and postnominal adjectives, agreeing', () => {
    expect(npText(np(CHAUN, {}, { adjectives: [adj(GROND)] }))).toBe('il grond chaun');
    expect(npText(np(CHASA, { number: 'plural' }, { adjectives: [adj(GROND), adj(NAIR)] }))).toBe('las grondas chasas nairas');
  });

  test("l' elides on the word that follows it", () => {
    expect(npText(np(UM))).toBe("l'um");
    expect(npText(np(GIAT, {}, { adjectives: [concept(AUTER, 'OTHER')] }))).toBe("l'auter giat");
  });

  test('a pronominal possessive takes no article', () => {
    expect(npText(np(GIAT, {}, { possessor: MY }))).toBe('mes giat');
    expect(npText(np(CHASA, { number: 'plural' }, { possessor: MY }))).toBe('mias chasas');
    expect(npText(np(CHASA, {}, { possessor: THEIR }))).toBe('lur chasa');
  });

  test('a genitive possessor follows under da, contracting', () => {
    expect(npText(np(CHASA, {}, { possessor: np(CHAUN) }))).toBe('la chasa dal chaun');
    expect(npText(np(CHASA, {}, { possessor: np(DUNNA) }))).toBe('la chasa da la dunna');
  });

  test('an attributive noun follows bare under its relation', () => {
    expect(npText(np(BARTGA, {}, { nounModifiers: [nounModifier(VELA)] }))).toBe('la bartga a vela');
  });

  test('a numeral stands between the determiner and the noun, agreeing at two', () => {
    expect(npText(np(CHASA, { number: 'plural', numeral: '2', definiteness: 'bare' }))).toBe('duas chasas');
  });
});
