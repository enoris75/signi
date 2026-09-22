import { describe, expect, test } from 'vitest';
import { AFRIQUE, AGE, ANGE, CHAT, HAUTEUR, HOMME } from './fr.fixtures.js';
import { elidesBefore } from './elidesBefore.js';

describe('elidesBefore', () => {
  test('elides before a vowel letter, accented or capitalised', () => {
    expect(elidesBefore(ANGE, 'ange')).toBe(true);
    expect(elidesBefore(AGE, 'âge')).toBe(true);
    expect(elidesBefore(AFRIQUE, 'Afrique')).toBe(true);
  });

  test('elides before the œ ligature, which one seeded noun opens on', () => {
    expect(elidesBefore(CHAT, 'œil')).toBe(true);
  });

  test('does not elide before a consonant', () => {
    expect(elidesBefore(CHAT, 'chat')).toBe(false);
  });

  test('an h muet noun marked elides counts as vowel-initial, singular or plural', () => {
    expect(elidesBefore(HOMME, 'homme')).toBe(true);
    expect(elidesBefore(HOMME, 'hommes')).toBe(true);
  });

  test('an unmarked h is aspiré', () => {
    expect(elidesBefore(HAUTEUR, 'hauteur')).toBe(false);
  });

  test('the elides flag counts only when the noun itself leads', () => {
    expect(elidesBefore(HOMME, 'grand')).toBe(false);
  });

  test('a vowel-initial word leading a consonant-initial noun elides on its own spelling', () => {
    expect(elidesBefore(CHAT, 'autre')).toBe(true);
  });
});
