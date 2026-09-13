import { describe, expect, test } from 'vitest';
import { ALLER, CHAT, DEVOIR, FEMME, JE, MANGER, modal, POUVOIR, TOUJOURS, VITE, VOULOIR } from './fr.fixtures.js';
import { modalGroupFr } from './modalGroupFr.js';

describe('modalGroupFr', () => {
  test('the outermost modal is finite and governs the main infinitive', () => {
    expect(modalGroupFr([modal(DEVOIR)], MANGER, CHAT, 'present', 'neutral', undefined, ''))
      .toEqual({ finite: 'doit', finiteAdverb: '', tail: 'manger' });
  });

  test('the finite modal takes the tense and agrees with the subject', () => {
    expect(modalGroupFr([modal(DEVOIR)], MANGER, CHAT, 'past', 'neutral', undefined, '').finite).toBe('dut');
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
});
