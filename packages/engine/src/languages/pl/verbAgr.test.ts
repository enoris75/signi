import { describe, expect, test } from 'vitest';
import type { ResolvedNounPhrase } from '../../types.js';
import { verbAgr } from './verbAgr.js';
import { CHLOPIEC, DZIEWCZYNKA, JA, KOT, PIENIADZE, SIE } from './pl.fixtures.js';

const np = (forms: Record<string, string>): ResolvedNounPhrase => ({ head: { conceptId: '', forms }, adjectives: [], nounModifiers: [] });

describe('verbAgr', () => {
  test('a noun: 3rd person, its number and gender', () => {
    expect(verbAgr({ ...KOT, number: 'singular' })).toEqual({ person: '3', plural: false, gender: 'masc', virile: false });
    expect(verbAgr({ ...CHLOPIEC, number: 'plural' })).toEqual({ person: '3', plural: true, gender: 'masc', virile: true });
  });

  test('a pronoun keeps its person', () => {
    expect(verbAgr({ ...JA, number: 'plural' })).toEqual({ person: '1', plural: true, gender: 'masc', virile: true });
  });

  test('a quantified subject is 3rd singular neuter; większość feminine', () => {
    expect(verbAgr({ ...KOT, number: 'plural', definiteness: 'many' }).gender).toBe('neut');
    expect(verbAgr({ ...KOT, number: 'plural', definiteness: 'most' })).toEqual({ person: '3', plural: false, gender: 'fem', virile: false });
  });

  test('a numeral from five, or a virile one', () => {
    expect(verbAgr({ ...KOT, number: 'plural', numeral: '5' }).plural).toBe(false);
    expect(verbAgr({ ...KOT, number: 'plural', numeral: '2' }).plural).toBe(true);
    expect(verbAgr({ ...CHLOPIEC, number: 'plural', numeral: '2' }).gender).toBe('neut');
  });

  test('a plurale tantum is plural', () => {
    expect(verbAgr({ ...PIENIADZE, number: 'singular' }).plural).toBe(true);
  });

  test('the generic się', () => {
    expect(verbAgr(SIE).gender).toBe('neut');
  });

  test('a group is plural, virile if any conjunct is', () => {
    const group = [np(CHLOPIEC), np(DZIEWCZYNKA)];
    expect(verbAgr({ person: '3', number: 'plural', gender: 'masc' }, group).virile).toBe(true);
    expect(verbAgr({ person: '3', number: 'plural', gender: 'fem' }, [np(DZIEWCZYNKA), np(DZIEWCZYNKA)]).virile).toBe(false);
  });
});
