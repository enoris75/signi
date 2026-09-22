import { describe, expect, test } from 'vitest';
import { dativePronounForm } from './dativePronounForm.js';

// Italian and French 3rd person, the only one whose dative differs from its accusative.
const LUI = { person: '3', number: 'singular', gender: 'masc', object: 'lo', object_fem: 'la', object_neut: 'lo', object_plural: 'li', object_plural_fem: 'le', dative: 'gli', dative_fem: 'le', dative_neut: 'gli', dative_plural: 'gli' };
const IL = { person: '3', number: 'singular', gender: 'masc', object: 'le', object_fem: 'la', object_plural: 'les', dative: 'lui', dative_fem: 'lui', dative_neut: 'lui', dative_plural: 'leur' };
const MI = { person: '1', number: 'singular', object: 'mi', object_plural: 'ci' };

describe('dativePronounForm', () => {
  test('the seeded dative, by number and gender', () => {
    expect(dativePronounForm(LUI)).toBe('gli');
    expect(dativePronounForm({ ...LUI, gender: 'fem' })).toBe('le');
    expect(dativePronounForm({ ...LUI, gender: 'neut' })).toBe('gli');
    expect(dativePronounForm({ ...LUI, number: 'plural' })).toBe('gli');
    expect(dativePronounForm({ ...IL, number: 'plural' })).toBe('leur');
    expect(dativePronounForm({ ...IL, number: 'plural', gender: 'fem' })).toBe('leur');
  });

  test('a person that seeds none falls back to its accusative clitic', () => {
    expect(dativePronounForm(MI)).toBe('mi');
    expect(dativePronounForm({ ...MI, number: 'plural' })).toBe('ci');
  });

  test('a language that seeds none falls back throughout', () => {
    const him = { person: '3', number: 'singular', gender: 'masc', object: 'him', object_fem: 'her', object_plural: 'them' };
    expect(dativePronounForm(him)).toBe('him');
    expect(dativePronounForm({ ...him, gender: 'fem' })).toBe('her');
    expect(dativePronounForm({ ...him, number: 'plural' })).toBe('them');
  });

  test('a feminine plural takes its own row where one is seeded, and the plural otherwise', () => {
    expect(dativePronounForm({ ...LUI, number: 'plural', gender: 'fem', dative_plural_fem: 'gliene' })).toBe('gliene');
    expect(dativePronounForm({ ...LUI, number: 'plural', gender: 'fem' })).toBe('gli');
  });
});
