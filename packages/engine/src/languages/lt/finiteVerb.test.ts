import { describe, expect, test } from 'vitest';
import { finiteVerb } from './finiteVerb.js';
import { BUTI_VERB, VALGYTI } from './lt.fixtures.js';
import type { VerbAgr } from './lt.types.js';

const HE: VerbAgr = { person: '3', plural: false, gender: 'masc' };
const THEY: VerbAgr = { person: '3', plural: true, gender: 'fem' };
const I: VerbAgr = { person: '1', plural: false, gender: 'masc' };
const WE: VerbAgr = { person: '1', plural: true, gender: 'masc' };

describe('finiteVerb', () => {
  test('each tense in its aspect', () => {
    expect(finiteVerb(VALGYTI, HE, 'present', undefined, false)).toBe('valgo');
    expect(finiteVerb(VALGYTI, HE, 'past', undefined, true)).toBe('suvalgė');
    expect(finiteVerb(VALGYTI, HE, 'past', undefined, false)).toBe('valgė');
    expect(finiteVerb(VALGYTI, HE, 'future', undefined, true)).toBe('suvalgys');
    expect(finiteVerb(VALGYTI, HE, 'future', undefined, false)).toBe('valgys');
  });

  test('the 3rd person is one form for both numbers; the 1st and 2nd are their own', () => {
    expect(finiteVerb(VALGYTI, THEY, 'present', undefined, false)).toBe('valgo');
    expect(finiteVerb(VALGYTI, I, 'present', undefined, false)).toBe('valgau');
    expect(finiteVerb(VALGYTI, WE, 'past', undefined, true)).toBe('suvalgėme');
  });

  test('the frequentative past', () => {
    expect(finiteVerb(VALGYTI, HE, 'past', undefined, false, true)).toBe('valgydavo');
    expect(finiteVerb(VALGYTI, I, 'past', undefined, false, true)).toBe('valgydavau');
  });

  test('the conditional, and the moods said as it', () => {
    expect(finiteVerb(VALGYTI, HE, 'present', 'conditional', true)).toBe('suvalgytų');
    expect(finiteVerb(VALGYTI, I, 'present', 'conditional', true)).toBe('suvalgyčiau');
    expect(finiteVerb(VALGYTI, HE, 'past', 'subjunctive', false)).toBe('valgytų');
    expect(finiteVerb(VALGYTI, HE, 'present', 'presentSubjunctive', false)).toBe('valgytų');
  });

  test('būti', () => {
    expect(finiteVerb(BUTI_VERB, I, 'present', undefined, false)).toBe('esu');
    expect(finiteVerb(BUTI_VERB, HE, 'present', undefined, false)).toBe('yra');
    expect(finiteVerb(BUTI_VERB, HE, 'future', undefined, false)).toBe('bus');
  });
});
