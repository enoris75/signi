import { describe, expect, test } from 'vitest';
import type { PronominalPossessor } from '@signi/shared';
import { adj, CANE, nounModifier, np, PADRE, VECCHIO, VELA } from './it.fixtures.js';
import { itPossessedHeadForms } from './itPossessedHeadForms.js';

const pronominal = (person: '1' | '2' | '3', number: 'singular' | 'plural' = 'singular'): PronominalPossessor =>
  ({ kind: 'pronominal', person, number });

describe('itPossessedHeadForms', () => {
  test('a possessive rides on the definite article', () => {
    expect(itPossessedHeadForms(np(CANE, { definiteness: 'bare' }, { possessor: pronominal('3') }))['definiteness']).toBe('definite');
  });

  // A277: "un mio amico" — the singular indefinite article stacks like a demonstrative. A plural or a
  // mass indefinite writes no article, so the possessive keeps the definite one: "i miei cani".
  test('the singular indefinite keeps its article; the article-less plural takes the definite', () => {
    expect(itPossessedHeadForms(np(CANE, { definiteness: 'indefinite' }, { possessor: pronominal('3') }))['definiteness']).toBe('indefinite');
    expect(itPossessedHeadForms(np(PADRE, { definiteness: 'indefinite' }, { possessor: pronominal('1') }))['definiteness']).toBe('indefinite');
    expect(itPossessedHeadForms(np(CANE, { definiteness: 'indefinite', number: 'plural' }, { possessor: pronominal('3') }))['definiteness']).toBe('definite');
  });

  // A329: a numeral that took the indefinite's place stacks like the article: "due miei cani". A bare
  // head with no numeral (A330's predicate) keeps the definite: "i miei amici".
  test('a numeral standing in for the indefinite keeps the slot; a bare head without one does not', () => {
    const counted = { definiteness: 'bare', indefinite_dropped: '1', numeral: '2', number: 'plural' };
    expect(itPossessedHeadForms(np(CANE, counted, { possessor: pronominal('1') }))['definiteness']).toBe('bare');
    const { numeral: _n, ...uncounted } = counted;
    expect(itPossessedHeadForms(np(CANE, uncounted, { possessor: pronominal('1') }))['definiteness']).toBe('definite');
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

  // A187: Italian stacks a demonstrative or a quantifier with the possessive ("questo suo libro",
  // "tutti i suoi libri"), so those determiners keep their slot — `all` included, unlike the shared
  // `possessedHeadForms`.
  test('a demonstrative, a quantifier, `no` and `all` keep their slot', () => {
    for (const definiteness of ['this', 'that', 'some', 'many', 'few', 'no', 'all']) {
      expect(itPossessedHeadForms(np(CANE, { definiteness }, { possessor: pronominal('3') }))['definiteness']).toBe(definiteness);
    }
    // A possessed name drops `proper`, so it takes the determiner rather than the name's article.
    expect(itPossessedHeadForms(np(CANE, { definiteness: 'this', proper: '1' }, { possessor: pronominal('3') }))['proper']).toBeUndefined();
    // A kinship noun is no exception: "questo mio padre", not the bare "mio padre".
    expect(itPossessedHeadForms(np(PADRE, { definiteness: 'this' }, { possessor: pronominal('1') }))['definiteness']).toBe('this');
  });

  test('a phrase with no pronominal possessor keeps its own forms', () => {
    expect(itPossessedHeadForms(np(PADRE, { definiteness: 'indefinite' }))['definiteness']).toBe('indefinite');
    expect(itPossessedHeadForms(np(PADRE, {}, { possessor: np(CANE) }))['definiteness']).toBeUndefined();
  });

  // A336: an address has no article for the possessive to ride on — but loro keeps its own.
  test('a vocative head is bare beside any possessive but loro', () => {
    expect(itPossessedHeadForms(np(CANE, { vocative: '1', definiteness: 'bare' }, { possessor: pronominal('1') }))['definiteness']).toBe('bare');
    expect(itPossessedHeadForms(np(PADRE, { vocative: '1', number: 'plural' }, { possessor: pronominal('1') }))['definiteness']).toBe('bare');
    expect(itPossessedHeadForms(np(PADRE, { vocative: '1' }, { possessor: pronominal('3', 'plural') }))['definiteness']).toBe('definite');
  });
});
