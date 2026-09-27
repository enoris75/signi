import { describe, expect, test } from 'vitest';
import { ADINA, concept, MAI, PLI } from './rumgr.fixtures.js';
import { negated, withNa } from './negated.js';

const NEVER = concept(MAI, 'NEVER');
const NO_LONGER = concept(PLI, 'NO_LONGER');
const ALWAYS = concept(ADINA, 'ALWAYS');

describe('withNa', () => {
  test("na before a consonant, n' before a vowel or h", () => {
    expect(withNa('mangia')).toBe('na mangia');
    expect(withNa('è')).toBe("n'è");
    expect(withNa('ha')).toBe("n'ha");
    expect(withNa('avain')).toBe("n'avain");
    expect(withNa('ma tschent')).toBe('na ma tschent');
  });
});

describe('negated', () => {
  test('unnegated, the finite verb alone', () => {
    expect(negated('mangia', { na: false, betg: false })).toBe('mangia');
  });

  test('na … betg around the finite verb', () => {
    expect(negated('mangia', { na: true, betg: true })).toBe('na mangia betg');
    expect(negated('ha', { na: true, betg: true })).toBe("n'ha betg");
  });

  test('negative concord: na alone', () => {
    expect(negated('ves', { na: true, betg: false })).toBe('na ves');
  });

  test('mai takes betg\'s place', () => {
    expect(negated('vegn', { na: true, betg: false, adverb: NEVER, adverbText: 'mai' })).toBe('na vegn mai');
    expect(negated('ha', { na: true, betg: true, adverb: NEVER, adverbText: 'mai' })).toBe("n'ha mai");
  });

  test('pli follows betg', () => {
    expect(negated('vegn', { na: true, betg: false, adverb: NO_LONGER, adverbText: 'pli' })).toBe('na vegn betg pli');
  });

  test('anc precedes betg: not yet', () => {
    expect(negated('ha', { na: true, betg: true, adverb: ALWAYS, adverbText: 'anc' })).toBe("n'ha anc betg");
  });

  test('gnanc takes betg\'s place', () => {
    expect(negated('mangia', { na: true, betg: true, adverb: ALWAYS, adverbText: 'gnanc' })).toBe('na mangia gnanc');
  });

  test('a positive adverb follows betg, or the bare verb', () => {
    expect(negated('mangia', { na: true, betg: true, adverb: ALWAYS, adverbText: 'adina' })).toBe('na mangia betg adina');
    expect(negated('mangia', { na: false, betg: false, adverb: ALWAYS, adverbText: 'adina' })).toBe('mangia adina');
  });

  test('a sentence adverb leads the negation', () => {
    expect(negated('curra', { na: true, betg: true, lead: 'forsa' })).toBe('forsa na curra betg');
  });
});
