import { describe, expect, test } from 'vitest';
import { ALLER, CHAT, DEVOIR, FEMME, JE, MANGER, modal, POUVOIR, TOUJOURS, VITE, VOULOIR } from './fr.fixtures.js';
import { modalGroupFr } from './modalGroupFr.js';

/** A modal that denies itself — `ResolvedModal.negative`, an inner link's own negation (A03). */
const denied = (m: ReturnType<typeof modal>) => ({ ...m, negative: true });

describe('modalGroupFr', () => {
  test('the outermost modal is finite and governs the main infinitive', () => {
    expect(modalGroupFr([modal(DEVOIR)], MANGER, CHAT, 'present', 'neutral', undefined, ''))
      .toEqual({ finite: 'doit', finiteAdverb: '', tail: 'manger' });
  });

  test('the finite modal takes the tense and agrees with the subject', () => {
    // A modal names a state, so its past is the imparfait (A130).
    expect(modalGroupFr([modal(DEVOIR)], MANGER, CHAT, 'past', 'neutral', undefined, '').finite).toBe('devait');
    expect(modalGroupFr([modal(DEVOIR)], MANGER, { ...CHAT, number: 'plural' }, 'future', 'neutral', undefined, '').finite).toBe('devront');
    expect(modalGroupFr([modal(VOULOIR)], MANGER, JE, 'present', 'neutral', undefined, '').finite).toBe('veux');
  });

  test('under a hypothetical the finite modal takes the conditional or the imparfait', () => {
    expect(modalGroupFr([modal(DEVOIR)], MANGER, CHAT, 'present', 'neutral', 'conditional', '').finite).toBe('devrait');
    expect(modalGroupFr([modal(POUVOIR)], MANGER, CHAT, 'present', 'neutral', 'subjunctive', '').finite).toBe('pouvait');
  });

  test('inner modals trail as infinitives ahead of the main verb', () => {
    expect(modalGroupFr([modal(VOULOIR), modal(POUVOIR)], MANGER, CHAT, 'present', 'neutral', undefined, ''))
      .toEqual({ finite: 'veut', finiteAdverb: '', tail: 'pouvoir manger' });
    expect(modalGroupFr([modal(VOULOIR), modal(DEVOIR), modal(POUVOIR)], MANGER, CHAT, 'present', 'neutral', undefined, '').tail)
      .toBe('devoir pouvoir manger');
  });

  test('an inner modal’s linking preposition follows its infinitive', () => {
    expect(modalGroupFr([modal(VOULOIR), modal({ base: 'essayer', link: 'de' })], MANGER, CHAT, 'present', 'neutral', undefined, '').tail)
      .toBe('essayer de manger');
  });

  test('a marked aspect puts the main verb group in the infinitive', () => {
    expect(modalGroupFr([modal(DEVOIR)], MANGER, CHAT, 'present', 'resultative', undefined, '').tail).toBe('avoir mangé');
    expect(modalGroupFr([modal(DEVOIR)], ALLER, FEMME, 'present', 'resultative', undefined, '').tail).toBe('être allée');
    expect(modalGroupFr([modal(DEVOIR)], MANGER, CHAT, 'present', 'progressive', undefined, '').tail).toBe('être en train de manger');
  });

  // Returned apart so the caller can place it after the "ne … pas" bracket.
  test('the outermost modal’s adverb is returned on its own', () => {
    expect(modalGroupFr([modal(DEVOIR, TOUJOURS)], MANGER, CHAT, 'present', 'neutral', undefined, ''))
      .toEqual({ finite: 'doit', finiteAdverb: 'toujours', tail: 'manger' });
  });

  test('an inner modal’s frequency adverb precedes it and a manner adverb follows it', () => {
    expect(modalGroupFr([modal(VOULOIR), modal(POUVOIR, TOUJOURS)], MANGER, CHAT, 'present', 'neutral', undefined, '').tail)
      .toBe('toujours pouvoir manger');
    expect(modalGroupFr([modal(VOULOIR), modal(POUVOIR, VITE)], MANGER, CHAT, 'present', 'neutral', undefined, '').tail)
      .toBe('pouvoir vite manger');
  });

  test('the main verb’s frequency adverb leads its infinitive', () => {
    expect(modalGroupFr([modal(DEVOIR)], MANGER, CHAT, 'present', 'neutral', undefined, 'toujours').tail).toBe('toujours manger');
    expect(modalGroupFr([modal(DEVOIR)], MANGER, CHAT, 'present', 'resultative', undefined, 'toujours').tail).toBe('toujours avoir mangé');
  });

  // A88: the clitic goes before the main verb group's infinitive, never onto a modal.
  test('an object clitic leads the main verb group, after any inner modal and adverb', () => {
    expect(modalGroupFr([modal(DEVOIR)], MANGER, CHAT, 'present', 'neutral', undefined, '', 'me').tail).toBe('me manger');
    expect(modalGroupFr([modal(VOULOIR), modal(POUVOIR)], MANGER, CHAT, 'present', 'neutral', undefined, 'toujours', 'le').tail)
      .toBe('pouvoir toujours le manger');
    expect(modalGroupFr([modal(DEVOIR)], MANGER, CHAT, 'present', 'resultative', undefined, '', 'la', { gender: 'fem', number: 'singular' }).tail)
      .toBe("l'avoir mangée");
  });

  // A03: every element below the finite one carries a negation of its own, and French keeps "ne pas"
  // together in front of the group it denies instead of splitting around it.
  describe('a governed element’s own negation', () => {
    const nePas = (group: string) => `ne pas ${group}`;
    const ne = (group: string) => `ne ${group}`;

    test('an inner modal that denies itself takes the negator in front of it', () => {
      expect(modalGroupFr([modal(DEVOIR), denied(modal(POUVOIR))], MANGER, CHAT, 'present', 'neutral', undefined, '',
        '', undefined, '', nePas).tail).toBe('ne pas pouvoir manger');
    });

    test('the inner negator leads that modal’s own adverb, closest to the word it denies', () => {
      expect(modalGroupFr([modal(DEVOIR), denied(modal(POUVOIR, TOUJOURS))], MANGER, CHAT, 'present', 'neutral', undefined, '',
        '', undefined, '', nePas).tail).toBe('ne pas toujours pouvoir manger');
      expect(modalGroupFr([modal(DEVOIR), denied(modal(POUVOIR, VITE))], MANGER, CHAT, 'present', 'neutral', undefined, '',
        '', undefined, '', nePas).tail).toBe('ne pas pouvoir vite manger');
    });

    test('an unnegated inner modal is left alone, negator or none', () => {
      expect(modalGroupFr([modal(DEVOIR), modal(POUVOIR)], MANGER, CHAT, 'present', 'neutral', undefined, '',
        '', undefined, '', nePas).tail).toBe('pouvoir manger');
      expect(modalGroupFr([modal(DEVOIR), denied(modal(POUVOIR))], MANGER, CHAT, 'present', 'neutral', undefined, '').tail)
        .toBe('pouvoir manger');
    });

    test('the main verb’s negator leads its whole group — auxiliary, clitic and frequency adverb', () => {
      const negated = (aspect: 'neutral' | 'resultative' | 'progressive', freq: string, clitic: string) =>
        modalGroupFr([modal(DEVOIR)], MANGER, CHAT, 'present', aspect, undefined, freq, clitic, undefined, '', nePas, nePas).tail;
      expect(negated('neutral', '', '')).toBe('ne pas manger');
      expect(negated('resultative', '', '')).toBe('ne pas avoir mangé');
      expect(negated('progressive', '', '')).toBe('ne pas être en train de manger');
      expect(negated('neutral', 'toujours', '')).toBe('ne pas toujours manger');
      expect(negated('neutral', '', 'me')).toBe('ne pas me manger');
    });

    test('both negations at once deny each word on its own', () => {
      expect(modalGroupFr([modal(DEVOIR), denied(modal(POUVOIR))], MANGER, CHAT, 'present', 'neutral', undefined, '',
        '', undefined, '', nePas, nePas).tail).toBe('ne pas pouvoir ne pas manger');
    });

    // The caller drops the "pas" when a postverbal "aucun" is the negator this group really carries.
    test('the negator the caller builds is the one used, "ne" alone included', () => {
      expect(modalGroupFr([modal(VOULOIR)], MANGER, CHAT, 'present', 'neutral', undefined, '',
        '', undefined, '', ne, ne).tail).toBe('ne manger');
    });
  });
});
