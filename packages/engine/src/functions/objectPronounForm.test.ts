import { describe, expect, test } from 'vitest';
import { objectPronounForm } from './objectPronounForm.js';

const ER = { base: 'er', object: 'ihn', object_fem: 'sie', object_neut: 'es', object_plural: 'sie' };
const LUI = { base: 'lui', object: 'lo', object_fem: 'la', plural: 'loro', object_plural: 'li', object_plural_fem: 'le' };

describe('objectPronounForm', () => {
  test('a singular pronoun takes the object form of its gender', () => {
    expect(objectPronounForm({ ...ER, gender: 'masc' })).toBe('ihn');
    expect(objectPronounForm({ ...ER, gender: 'fem' })).toBe('sie');
    expect(objectPronounForm({ ...ER, gender: 'neut' })).toBe('es');
    expect(objectPronounForm({ base: 'io', object: 'mi' })).toBe('mi');
  });

  test('a plural reads its number from `number`, else from `count`', () => {
    expect(objectPronounForm({ ...LUI, number: 'plural' })).toBe('li');
    expect(objectPronounForm({ ...LUI, count: 'plural' })).toBe('li');
    expect(objectPronounForm({ ...LUI, number: 'singular', count: 'plural' })).toBe('lo');
  });

  // A72: Italian "le", Spanish "las", Portuguese "as".
  test('a feminine plural takes its own clitic where the language has one', () => {
    expect(objectPronounForm({ ...LUI, number: 'plural', gender: 'fem' })).toBe('le');
    expect(objectPronounForm({ ...ER, number: 'plural', gender: 'fem' })).toBe('sie');
  });

  test.each<[string, Record<string, string>, string]>([
    ['plural → subject plural', { number: 'plural', plural: 'noi', object: 'mi', base: 'io' }, 'noi'],
    ['plural → object', { number: 'plural', object: 'mi', base: 'io' }, 'mi'],
    ['plural → base', { number: 'plural', base: 'io' }, 'io'],
    ['plural → nothing', { number: 'plural' }, ''],
    ['feminine → object', { gender: 'fem', object: 'mi', base: 'io' }, 'mi'],
    ['feminine → base', { gender: 'fem', base: 'io' }, 'io'],
    ['feminine → nothing', { gender: 'fem' }, ''],
    ['neuter → object', { gender: 'neut', object: 'mi', base: 'io' }, 'mi'],
    ['neuter → base', { gender: 'neut', base: 'io' }, 'io'],
    ['neuter → nothing', { gender: 'neut' }, ''],
    ['singular → base', { base: 'io' }, 'io'],
    ['singular → nothing', {}, ''],
  ])('a missing form falls back: %s', (_, forms, expected) => {
    expect(objectPronounForm(forms)).toBe(expected);
  });
});
