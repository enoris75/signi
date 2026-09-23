import { describe, expect, test } from 'vitest';
import type { NounElement } from '@signi/shared';
import { clause, np, say, sayAll } from '../harness.js';

const readsFor = (phrase: NounElement) =>
  sayAll(clause(np('WOMAN'), 'READ', { complements: { purpose: { phrase } } }));

// The nominal *for* (P09-E2): the beneficiary or the goal an act is for, when that is a thing and not
// an act — the act is the purpose *clause* ("click to change", test/purpose.test.ts). One type for
// both readings: every language here spells the two alike (*per / pour / für / para / のために*), and
// the noun tells them apart. Plan-only: the canvas has no box for it yet.
describe('purpose', () => {
  test('a definite beneficiary', () => {
    expect(readsFor(np('MAN'))).toEqual({
      en: 'the woman reads for the man.',
      it: "la donna legge per l'uomo.", // "per" fuses with nothing
      fr: "la femme lit pour l'homme.",
      de: 'die Frau liest für den Mann.', // für governs the accusative
      es: 'la mujer lee para el hombre.',
      pt: 'a mulher lê para o homem.',
      ja: '女は男のために読みます。',
    });
  });

  test('an indefinite one', () => {
    expect(readsFor(np('CHILD', { definiteness: 'indefinite' }))).toEqual({
      en: 'the woman reads for a child.',
      it: 'la donna legge per un bambino.',
      fr: 'la femme lit pour un enfant.',
      de: 'die Frau liest für ein Kind.',
      es: 'la mujer lee para un niño.',
      pt: 'a mulher lê para uma criança.',
      ja: '女は子供のために読みます。',
    });
  });

  test('a plural one', () => {
    expect(readsFor(np('CHILD', { number: 'plural' }))).toEqual({
      en: 'the woman reads for the children.',
      it: 'la donna legge per i bambini.',
      fr: 'la femme lit pour les enfants.',
      de: 'die Frau liest für die Kinder.',
      es: 'la mujer lee para los niños.',
      pt: 'a mulher lê para as crianças.',
      ja: '女は子供のために読みます。',
    });
  });

  // A pronoun takes its tonic form behind the preposition, as it does behind every other one
  // (TONIC_COMPLEMENTS) — and in German the accusative "für" asks for: "für mich", "für sie".
  test('a pronoun, in its tonic form', () => {
    expect(readsFor(np('THIRD_PERSON', { gender: 'fem' }))).toEqual({
      en: 'the woman reads for her.',
      it: 'la donna legge per lei.',
      fr: 'la femme lit pour elle.',
      de: 'die Frau liest für sie.',
      es: 'la mujer lee para ella.',
      pt: 'a mulher lê para ela.',
      ja: '女は彼女のために読みます。',
    });
    expect(readsFor(np('FIRST_PERSON'))).toEqual({
      en: 'the woman reads for me.',
      it: 'la donna legge per me.',
      fr: 'la femme lit pour moi.',
      de: 'die Frau liest für mich.',
      es: 'la mujer lee para mí.',
      pt: 'a mulher lê para mim.',
      ja: '女は私のために読みます。',
    });
  });

  // The goal reading: the same words, a thing rather than a person.
  test('a goal that is a thing takes the same adposition', () => {
    expect(sayAll(clause(np('CAT'), 'RUN', { complements: { purpose: { phrase: np('FOOD') } } }))).toEqual({
      en: 'the cat runs for the food.',
      it: 'il gatto corre per il cibo.',
      fr: 'le chat court pour la nourriture.',
      de: 'der Kater läuft für das Essen.',
      es: 'el gato corre para la comida.',
      pt: 'o gato corre para a comida.',
      ja: '猫は食べ物のために走ります。',
    });
  });

  // The reason and the goal together, the goal last (COMPLEMENT_RENDER_ORDER).
  test('follows the cause', () => {
    expect(sayAll(clause(np('CAT'), 'RUN', {
      complements: { purpose: { phrase: np('MAN') }, cause: { phrase: np('DOG') } },
    }))).toMatchObject({
      en: 'the cat runs because of the dog for the man.',
      it: "il gatto corre a causa del cane per l'uomo.",
      de: 'der Kater läuft wegen des Hundes für den Mann.',
    });
  });

  test('German: "für" is accusative for every gender and number', () => {
    const de = (phrase: NounElement) => say(clause(np('CAT'), 'RUN', { complements: { purpose: { phrase } } }), 'de');
    expect(de(np('DOG', { definiteness: 'indefinite' }))).toBe('der Kater läuft für einen Hund.');
    expect(de(np('HOUSE'))).toBe('der Kater läuft für das Haus.');
    expect(de(np('THIRD_PERSON'))).toBe('der Kater läuft für ihn.');
  });
});
