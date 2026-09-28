import { describe, expect, test } from 'vitest';
import type { ResolvedNounPhrase } from '../../types.js';
import { verbAgr } from './verbAgr.js';
import { AS, GENERIC, KATE, MOTERIS, PINIGAI, VYRAS } from './lt.fixtures.js';

const np = (forms: Record<string, string>): ResolvedNounPhrase => ({ head: { conceptId: '', forms }, adjectives: [], nounModifiers: [] });

describe('verbAgr', () => {
  test('a noun: 3rd person, its number and gender', () => {
    expect(verbAgr({ ...KATE, number: 'singular' })).toEqual({ person: '3', plural: false, gender: 'fem' });
    expect(verbAgr({ ...VYRAS, number: 'plural' })).toEqual({ person: '3', plural: true, gender: 'masc' });
  });

  test('a pronoun keeps its person', () => {
    expect(verbAgr({ ...AS, number: 'plural' })).toEqual({ person: '1', plural: true, gender: 'masc' });
  });

  test('a quantified subject counts as a plural', () => {
    expect(verbAgr({ ...KATE, number: 'singular', definiteness: 'many' }).plural).toBe(true);
    expect(verbAgr({ ...KATE, number: 'plural', numeral: '5' }).plural).toBe(true);
  });

  test('a plurale tantum is plural; a genderless subject neuter; the generic masculine', () => {
    expect(verbAgr({ ...PINIGAI, number: 'singular' }).plural).toBe(true);
    expect(verbAgr({ person: '3', gender: 'neut' }).gender).toBe('neut');
    expect(verbAgr(GENERIC)).toEqual({ person: '3', plural: false, gender: 'masc' });
  });

  test('a group is plural, feminine only if every conjunct is', () => {
    expect(verbAgr({ person: '3', number: 'plural' }, [np(VYRAS), np(MOTERIS)]).gender).toBe('masc');
    expect(verbAgr({ person: '3', number: 'plural' }, [np(KATE), np(MOTERIS)])).toEqual({ person: '3', plural: true, gender: 'fem' });
  });
});
