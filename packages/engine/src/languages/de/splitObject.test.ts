import { describe, expect, test } from 'vitest';
import { el, ER, ICH, KATER, MAUS, np } from './de.fixtures.js';
import { splitObject } from './splitObject.js';

describe('splitObject', () => {
  test('a pronoun object is the pronoun, in the accusative', () => {
    expect(splitObject(el(np(ER)), '')).toEqual({ pronoun: 'ihn', noun: '', prepositional: '' });
    expect(splitObject(el(np(ICH, { number: 'plural' })), '')).toEqual({ pronoun: 'uns', noun: '', prepositional: '' });
  });

  test('a noun object is the noun', () => {
    expect(splitObject(el(np(MAUS)), '')).toEqual({ pronoun: '', noun: 'die Maus', prepositional: '' });
  });

  test('a coordination is not an unstressed pronoun, even of pronouns', () => {
    expect(splitObject(el(np(ER), np(ICH)), '')).toEqual({ pronoun: '', noun: 'ihn und mich', prepositional: '' });
    expect(splitObject(el(np(KATER), np(ER)), '')).toEqual({ pronoun: '', noun: 'den Kater und ihn', prepositional: '' });
  });

  // A139: CLICK takes its object with "auf".
  test('an object a preposition leads is a prepositional phrase in the accusative', () => {
    expect(splitObject(el(np(MAUS)), '', 'auf')).toEqual({ pronoun: '', noun: '', prepositional: 'auf die Maus' });
    expect(splitObject(el(np(ER)), '', 'auf')).toEqual({ pronoun: '', noun: '', prepositional: 'auf ihn' });
    expect(splitObject(el(np(KATER), np(ICH)), '', 'auf')).toEqual({ pronoun: '', noun: '', prepositional: 'auf den Kater und mich' });
  });

  test('a neuter pronoun a preposition leads is the da-compound', () => {
    expect(splitObject(el(np(ER, { gender: 'neut' })), '', 'auf')).toEqual({ pronoun: '', noun: '', prepositional: 'darauf' });
    expect(splitObject(el(np(ER, { gender: 'neut' })), '', 'mit').prepositional).toBe('damit');
  });

  test('with no object, the pro-form of an elided predicate is the pronoun', () => {
    expect(splitObject(undefined, 'es')).toEqual({ pronoun: 'es', noun: '', prepositional: '' });
    expect(splitObject(undefined, '')).toEqual({ pronoun: '', noun: '', prepositional: '' });
  });
});
