import { describe, expect, test } from 'vitest';
import type { CauseSentiment, Specifier } from '@signi/shared';
import { complement, DU, el, ER, type Forms, ICH, KATZE, MANN, np } from '../de.fixtures.js';
import { causePhrase } from './causePhrase.js';

const sentiment = (value: CauseSentiment): Specifier => ({ kind: 'sentiment', value });
const negative = [sentiment('negative')];

describe('causePhrase', () => {
  // "wegen" / "dank" + the dative, spelled on the article, is the shared prepositional path's.
  test('leaves a neutral or positive noun cause to the prepositional path', () => {
    expect(causePhrase(complement(np(MANN)))).toBeUndefined();
    expect(causePhrase(complement(np(MANN), [sentiment('positive')]))).toBeUndefined();
    expect(causePhrase(complement(el(np(MANN), np(KATZE))))).toBeUndefined();
  });

  test('a negative noun cause hangs a genitive off "durch die Schuld"', () => {
    expect(causePhrase(complement(np(MANN), negative))).toBe('durch die Schuld des Mannes');
    expect(causePhrase(complement(np(KATZE), negative))).toBe('durch die Schuld der Katze');
    expect(causePhrase(complement(np(MANN, { number: 'plural' }), negative))).toBe('durch die Schuld der Männer');
    expect(causePhrase(complement(el(np(MANN), np(KATZE)), negative))).toBe('durch die Schuld des Mannes und der Katze');
  });

  test('a negative relativizer blames through its genitive, ahead of "Schuld"', () => {
    expect(causePhrase(complement(np(MANN, { definiteness: 'relative' }), negative))).toBe('durch dessen Schuld');
    expect(causePhrase(complement(np(KATZE, { definiteness: 'relative' }), negative))).toBe('durch deren Schuld');
    expect(causePhrase(complement(np(MANN, { definiteness: 'relative', number: 'plural' }), negative))).toBe('durch deren Schuld');
  });

  test('a pronoun cause takes its dative form with no article', () => {
    expect(causePhrase(complement(np(ER)))).toBe('wegen ihm');
    expect(causePhrase(complement(np(DU), [sentiment('positive')]))).toBe('dank dir');
    expect(causePhrase(complement(np(ICH, { number: 'plural', disjunctive: 'uns' }), [sentiment('positive')]))).toBe('dank uns');
  });

  // The possessive agrees with feminine "Schuld", and picks its stem by the pronoun's person/number/gender.
  test('a negative pronoun cause is "durch <possessive> Schuld"', () => {
    const blame = (forms: Forms, extra: Forms = {}) => causePhrase(complement(np(forms, extra), negative));
    expect(blame(ICH)).toBe('durch meine Schuld');
    expect(blame(DU)).toBe('durch deine Schuld');
    expect(blame(ER)).toBe('durch seine Schuld');
    expect(blame(ER, { gender: 'neut' })).toBe('durch seine Schuld');
    expect(blame(ER, { gender: 'fem' })).toBe('durch ihre Schuld');
    expect(blame(ICH, { number: 'plural' })).toBe('durch unsere Schuld');
    expect(blame(DU, { number: 'plural' })).toBe('durch eure Schuld');
    expect(blame(ER, { number: 'plural' })).toBe('durch ihre Schuld');
  });

  test('a pronoun with no stored dative falls back to its base form, and with neither drops out of its group', () => {
    expect(causePhrase(complement(np({ base: 'es', person: '3' })))).toBe('wegen es');
    expect(causePhrase(complement(el(np(MANN), np({ person: '3' }))))).toBe('wegen dem Mann');
  });

  test('a group holding a pronoun renders each conjunct in its own form, never the first one\'s', () => {
    expect(causePhrase(complement(el(np(MANN), np(DU))))).toBe('wegen dem Mann und dir');
    expect(causePhrase(complement(el(np(DU), np(KATZE)), [sentiment('positive')]))).toBe('dank dir und der Katze');
    expect(causePhrase(complement(el(np(ICH), np(DU)), negative))).toBe('durch meine und deine Schuld');
    expect(causePhrase(complement(el(np(MANN), np(ER, { gender: 'fem' })), negative)))
      .toBe('durch die Schuld des Mannes und durch ihre Schuld');
  });
});
