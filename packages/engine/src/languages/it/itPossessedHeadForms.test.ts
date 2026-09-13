import { describe, expect, test } from 'vitest';
import type { PronominalPossessor } from '@signi/shared';
import { adj, CANE, nounModifier, np, PADRE, VECCHIO, VELA } from './it.fixtures.js';
import { itPossessedHeadForms } from './itPossessedHeadForms.js';

const pronominal = (person: '1' | '2' | '3', number: 'singular' | 'plural' = 'singular'): PronominalPossessor =>
  ({ kind: 'pronominal', person, number });

describe('itPossessedHeadForms', () => {
  test('a possessive rides on the definite article', () => {
    expect(itPossessedHeadForms(np(CANE, { definiteness: 'indefinite' }, { possessor: pronominal('3') }))['definiteness']).toBe('definite');
  });

  test('a singular, unmodified kinship noun under a possessive goes bare', () => {
    expect(itPossessedHeadForms(np(PADRE, {}, { possessor: pronominal('1') }))['definiteness']).toBe('bare');
    expect(itPossessedHeadForms(np(PADRE, {}, { possessor: pronominal('2', 'plural') }))['definiteness']).toBe('bare');
  });

  test('loro, the plural and a modifier bring the article back', () => {
    expect(itPossessedHeadForms(np(PADRE, {}, { possessor: pronominal('3', 'plural') }))['definiteness']).toBe('definite');
    expect(itPossessedHeadForms(np(PADRE, { number: 'plural' }, { possessor: pronominal('1') }))['definiteness']).toBe('definite');
    expect(itPossessedHeadForms(np(PADRE, {}, { possessor: pronominal('1'), adjectives: [adj(VECCHIO)] }))['definiteness']).toBe('definite');
    expect(itPossessedHeadForms(np(PADRE, {}, { possessor: pronominal('1'), nounModifiers: [nounModifier(VELA)] }))['definiteness']).toBe('definite');
  });

  test('a phrase with no pronominal possessor keeps its own forms', () => {
    expect(itPossessedHeadForms(np(PADRE, { definiteness: 'indefinite' }))['definiteness']).toBe('indefinite');
    expect(itPossessedHeadForms(np(PADRE, {}, { possessor: np(CANE) }))['definiteness']).toBeUndefined();
  });
});
