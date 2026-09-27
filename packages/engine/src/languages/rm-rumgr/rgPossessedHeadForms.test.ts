import { describe, expect, test } from 'vitest';
import type { PronominalPossessor } from '@signi/shared';
import { AUA, CHAUN, CUDESCH, EUROPA, GIAT, np } from './rumgr.fixtures.js';
import { rgPossessedHeadForms } from './rgPossessedHeadForms.js';

const mine: PronominalPossessor = { kind: 'pronominal', person: '1', number: 'singular' };
const definiteness = (...args: Parameters<typeof np>) => rgPossessedHeadForms(np(...args))['definiteness'];

describe('rgPossessedHeadForms', () => {
  test('without a pronominal possessor the head keeps its own forms', () => {
    expect(rgPossessedHeadForms(np(GIAT))).toEqual(GIAT);
    expect(rgPossessedHeadForms(np(CUDESCH, {}, { possessor: np(CHAUN) }))).toEqual(CUDESCH);
  });

  test('a possessive takes no article: the definite head goes bare', () => {
    expect(definiteness(GIAT, {}, { possessor: mine })).toBe('bare');
    expect(definiteness(GIAT, { definiteness: 'definite', number: 'plural' }, { possessor: mine })).toBe('bare');
  });

  test('a determiner of its own keeps its slot', () => {
    expect(definiteness(CUDESCH, { definiteness: 'this' }, { possessor: mine })).toBe('this');
    expect(definiteness(CUDESCH, { definiteness: 'no' }, { possessor: mine })).toBe('no');
    expect(definiteness(CUDESCH, { definiteness: 'all' }, { possessor: mine })).toBe('all');
    expect(definiteness(CUDESCH, { definiteness: 'most' }, { possessor: mine })).toBe('most');
    expect(definiteness(CUDESCH, { definiteness: 'indefinite' }, { possessor: mine })).toBe('indefinite');
  });

  test('a plural or a mass indefinite has no article to stack on, and goes bare', () => {
    expect(definiteness(CUDESCH, { definiteness: 'indefinite', number: 'plural' }, { possessor: mine })).toBe('bare');
    expect(definiteness(AUA, { definiteness: 'indefinite' }, { possessor: mine })).toBe('bare');
  });

  test('a numeral that took the indefinite article\'s place keeps it', () => {
    const forms = rgPossessedHeadForms(np(CUDESCH, { definiteness: 'bare', numeral: '2', indefinite_dropped: '1', number: 'plural' }, { possessor: mine }));
    expect(forms['definiteness']).toBe('bare');
    expect(forms['indefinite_dropped']).toBe('1');
    expect(definiteness(CUDESCH, { definiteness: 'bare', number: 'plural' }, { possessor: mine })).toBe('bare');
  });

  test('a possessed proper name loses its proper flag', () => {
    expect(rgPossessedHeadForms(np(EUROPA, {}, { possessor: mine }))['proper']).toBeUndefined();
    expect(rgPossessedHeadForms(np(EUROPA, { definiteness: 'this' }, { possessor: mine }))['proper']).toBeUndefined();
  });
});
