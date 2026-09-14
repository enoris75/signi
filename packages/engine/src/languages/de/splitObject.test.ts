import { describe, expect, test } from 'vitest';
import { el, ER, ICH, KATER, MAUS, np } from './de.fixtures.js';
import { splitObject } from './splitObject.js';

describe('splitObject', () => {
  test('a pronoun object is the pronoun, in the accusative', () => {
    expect(splitObject(el(np(ER)), '')).toEqual({ pronoun: 'ihn', noun: '' });
    expect(splitObject(el(np(ICH, { number: 'plural' })), '')).toEqual({ pronoun: 'uns', noun: '' });
  });

  test('a noun object is the noun', () => {
    expect(splitObject(el(np(MAUS)), '')).toEqual({ pronoun: '', noun: 'die Maus' });
  });

  test('a coordination is not an unstressed pronoun, even of pronouns', () => {
    expect(splitObject(el(np(ER), np(ICH)), '')).toEqual({ pronoun: '', noun: 'ihn und mich' });
    expect(splitObject(el(np(KATER), np(ER)), '')).toEqual({ pronoun: '', noun: 'den Kater und ihn' });
  });

  test('with no object, the pro-form of an elided predicate is the pronoun', () => {
    expect(splitObject(undefined, 'es')).toEqual({ pronoun: 'es', noun: '' });
    expect(splitObject(undefined, '')).toEqual({ pronoun: '', noun: '' });
  });
});
